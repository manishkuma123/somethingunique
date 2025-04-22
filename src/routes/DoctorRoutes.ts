import express from "express";
import { createDoctor, deleteDoctor, doctorAppointmentData, getDoctors, getOneDoctor, loginDoctor, updateDoctor } from "../controllers/DoctorController";

import multer from 'multer'

import { register ,login, protect, adminProtect, getAllUsers, sendMessage, getMessages, adminSendMessage} from '../controllers/auth';


const router = express.Router();
const storage = multer.memoryStorage();


const upload = multer({ storage, limits:{
    fileSize: 5* 1024 *1024
} }); 

router.post('/',   createDoctor);
router.post('/login-doctor', loginDoctor)
router.patch('/:id', adminProtect, upload.single('picture'),updateDoctor )
router.get('/', getDoctors);
router.get('/:id', getOneDoctor);

router.delete('/:id',adminProtect,  deleteDoctor);
router.get('/doctor-appointment-statistics/:id',  adminProtect, doctorAppointmentData)

export default router;