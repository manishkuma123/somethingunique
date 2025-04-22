import {Request, Response} from "express";
import Doctor from "../models/Doctor";
import jwt from 'jsonwebtoken';
import dotenv from "dotenv"

import {Mongoose, ObjectId } from "mongoose";
import Appointment from "../models/appointment";
import mongoose from "mongoose";
import cloudinary from "../cloudnairy";

import multer from 'multer';
import path from 'path';

dotenv.config();


const uploadImage = async (file: Express.Multer.File) => {
    const image = file
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    const uploadResponse = await cloudinary.uploader.upload(dataURI, {
        quality: "auto",
        fetch_format: "auto",
        timeout:180000
    });
    

    return uploadResponse.url;


}
const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'uploads/'), 
    filename: (req, file, cb) => cb(null, Date.now() + path.extname(file.originalname)), 
  }),
  limits: { fileSize: 5 * 1024 * 1024 }, 
}).single('image');



export const createDoctor = async(req:any, res:any) : Promise<void>=>{
    const {email} = req.body;
    

    try{
        const existingDoctor = await Doctor.findOne({email});
        if(existingDoctor){
            res.status(400).json({
                message: "Email already taken"
            })
            return;
        }
       
        const newDoctor = await Doctor.create(req.body);

        res.status(201).json({
            message: "Doctor successfully created",
            newDoctor
        })

    }catch(err: any){
        res.status(400).json(err);
        return;
    }
}

export const loginDoctor = async (req: any, res: any): Promise<void> => {
    const {email, password} = req.body;

    if (!email || !password) {
        res.status(400).json({
            message: "Please provide email and password"
        })
        return;
    }

    const doctor = await Doctor.findOne({email}).select("+password");

    if(!doctor || !(await doctor.correctPassword(password, doctor.password))){
        res.status(401).json({
            message: "Incorrect email or password"
        })
        return;
    }
     const token = jwt.sign({ id: doctor._id, email: doctor.email },  process.env.JWT_SECRET as string,{ expiresIn: '24h' });
      
    res.json( { token ,doctor})

    
}


export const getDoctors =  async(req: any, res: any) : Promise<void>=>{
    const { speciality } = req.query;



    try{
        const query = speciality ? { speciality } : {}; 
        const allDoctors = await Doctor.find(query).select("availability name speciality picture");
       if(!allDoctors){
            res.status(404).json({ message: "No Doctors not found" });
            return;
        }

        res.status(200).json(allDoctors);

    }catch(err: any){
        console.log(err);
        res.status(500).json({
            message: "error getting users"
        })
    }
}


export const getOneDoctor = async(req: any, res: any) : Promise<void>=>{
      const {id} = req.params;
   
    try{
        const doctor =  await Doctor.findById(id) 
        if(!doctor){
            res.status(404).json({ message: "No Doctors not found" });
            return;
        }
        res.status(200).json(doctor);

    }catch(err){
        console.log(err);

        res.status(500).json({
            message: "error getting users"
        })
    }
}



export const updateDoctor = async (req:any , res: any): Promise<void> => {
    const {name,  address1 , address2 , speciality, experience, degree, fee, about, availability} = req.body;
    const {id} = req.params;
    console.log(req.body)
    try{
        const existingDoctor = await Doctor.findById(id);

        if(!existingDoctor){
            res.status(404).json({ message: "User not found" });
            return;
        }

        existingDoctor.name = name || existingDoctor.name;
        existingDoctor.address1 = address1 || existingDoctor.address1;
        existingDoctor.address2 = address2 || existingDoctor.address2;
        existingDoctor.speciality = speciality || existingDoctor.speciality;
        existingDoctor.experience = experience || existingDoctor.experience;
        existingDoctor.degree = degree || existingDoctor.degree;
        existingDoctor.fee = fee || existingDoctor.fee;
        existingDoctor.about = about || existingDoctor.about;
        existingDoctor.availability = availability || existingDoctor.availability;

        if(req.file){
            const imageUrl = await uploadImage(req.file as Express.Multer.File);
            existingDoctor.picture = imageUrl;
        }

        await existingDoctor.save();
        

        res.status(201).json({
            existingDoctor
        })




    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "error getting users"
        })
    }

}

export const deleteDoctor =  async (req: any, res:any): Promise<void> => {
    const {name,  address1 , address2 , speciality, experience, degree, fee, about} = req.body;
    const {id} = req.params;
    
    try{
        const existingDoctor = await Doctor.findByIdAndDelete(id)
      
        res.status(204).json({message: "doctor deleted"})





    }catch(err){
        console.log(err);
        res.status(500).json({
            message: "error getting users"
        })
    }

}

export const doctorAppointmentData = async (req:any , res: any): Promise<void> =>{
     const {id} = req.params
     try{
        
        const stats = await Appointment.aggregate([
            {
                $match: { doctor: new mongoose.Types.ObjectId(id) }, // Match appointments for the doctor
            },
            {
                $lookup: {
                    from: "doctors", // The collection where doctors are stored
                    localField: "doctor", // Field in Appointment referencing Doctor
                    foreignField: "_id", // Field in Doctor referencing itself
                    as: "doctorData", // Alias for the joined data
                },
            },
            {
                $unwind: "$doctorData", 
            },
            {
                $group: {
                    _id: null, // Group all data
                    earning: { $sum: "$doctorData.fee" }, // Sum of doctor fees
                    appointment: { $sum: 1 }, // Count total appointments
                    uniquePatients: { $addToSet: "$user" }, // Collect unique user IDs (patients)
                },
            },
            {
                $project: {
                    _id: 0,
                    earning: 1,
                    appointment: 1,
                    uniquePatients: 1,
                    patientCount: { $size: "$uniquePatients" }, // Count unique patients
                },
            },
        ]);

        res.status(200).json(stats);

     }catch(err){
        res.status(500).json(err);
        return;
     }


} 