"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.doctorAppointmentData = exports.deleteDoctor = exports.updateDoctor = exports.getOneDoctor = exports.getDoctors = exports.loginDoctor = exports.createDoctor = void 0;
const Doctor_1 = __importDefault(require("../models/Doctor"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const dotenv_1 = __importDefault(require("dotenv"));
const appointment_1 = __importDefault(require("../models/appointment"));
const mongoose_1 = __importDefault(require("mongoose"));
const cloudnairy_1 = __importDefault(require("../cloudnairy"));
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
dotenv_1.default.config();
const uploadImage = (file) => __awaiter(void 0, void 0, void 0, function* () {
    const image = file;
    const base64Image = Buffer.from(image.buffer).toString("base64");
    const dataURI = `data:${image.mimetype};base64,${base64Image}`;
    const uploadResponse = yield cloudnairy_1.default.uploader.upload(dataURI, {
        quality: "auto",
        fetch_format: "auto",
        timeout: 180000
    });
    return uploadResponse.url;
});
const upload = (0, multer_1.default)({
    storage: multer_1.default.diskStorage({
        destination: (req, file, cb) => cb(null, 'uploads/'),
        filename: (req, file, cb) => cb(null, Date.now() + path_1.default.extname(file.originalname)),
    }),
    limits: { fileSize: 5 * 1024 * 1024 },
}).single('image');
const createDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const existingDoctor = yield Doctor_1.default.findOne({ email });
        if (existingDoctor) {
            res.status(400).json({
                message: "Email already taken"
            });
            return;
        }
        const newDoctor = yield Doctor_1.default.create(req.body);
        res.status(201).json({
            message: "Doctor successfully created",
            newDoctor
        });
    }
    catch (err) {
        res.status(400).json(err);
        return;
    }
});
exports.createDoctor = createDoctor;
const loginDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email, password } = req.body;
    if (!email || !password) {
        res.status(400).json({
            message: "Please provide email and password"
        });
        return;
    }
    const doctor = yield Doctor_1.default.findOne({ email }).select("+password");
    if (!doctor || !(yield doctor.correctPassword(password, doctor.password))) {
        res.status(401).json({
            message: "Incorrect email or password"
        });
        return;
    }
    const token = jsonwebtoken_1.default.sign({ id: doctor._id, email: doctor.email }, process.env.JWT_SECRET, { expiresIn: '24h' });
    res.json({ token, doctor });
});
exports.loginDoctor = loginDoctor;
const getDoctors = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { speciality } = req.query;
    try {
        const query = speciality ? { speciality } : {};
        const allDoctors = yield Doctor_1.default.find(query).select("availability name speciality picture");
        if (!allDoctors) {
            res.status(404).json({ message: "No Doctors not found" });
            return;
        }
        res.status(200).json(allDoctors);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "error getting users"
        });
    }
});
exports.getDoctors = getDoctors;
const getOneDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const doctor = yield Doctor_1.default.findById(id);
        if (!doctor) {
            res.status(404).json({ message: "No Doctors not found" });
            return;
        }
        res.status(200).json(doctor);
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "error getting users"
        });
    }
});
exports.getOneDoctor = getOneDoctor;
const updateDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address1, address2, speciality, experience, degree, fee, about, availability } = req.body;
    const { id } = req.params;
    console.log(req.body);
    try {
        const existingDoctor = yield Doctor_1.default.findById(id);
        if (!existingDoctor) {
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
        if (req.file) {
            const imageUrl = yield uploadImage(req.file);
            existingDoctor.picture = imageUrl;
        }
        yield existingDoctor.save();
        res.status(201).json({
            existingDoctor
        });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "error getting users"
        });
    }
});
exports.updateDoctor = updateDoctor;
const deleteDoctor = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { name, address1, address2, speciality, experience, degree, fee, about } = req.body;
    const { id } = req.params;
    try {
        const existingDoctor = yield Doctor_1.default.findByIdAndDelete(id);
        res.status(204).json({ message: "doctor deleted" });
    }
    catch (err) {
        console.log(err);
        res.status(500).json({
            message: "error getting users"
        });
    }
});
exports.deleteDoctor = deleteDoctor;
const doctorAppointmentData = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const stats = yield appointment_1.default.aggregate([
            {
                $match: { doctor: new mongoose_1.default.Types.ObjectId(id) }, // Match appointments for the doctor
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
    }
    catch (err) {
        res.status(500).json(err);
        return;
    }
});
exports.doctorAppointmentData = doctorAppointmentData;
