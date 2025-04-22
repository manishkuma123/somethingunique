
import { Router } from 'express';
import { createAppointment, getAppointmentall, getAppointments, updateAppointment } from '../controllers/AppointmentController';
import {protect, adminProtect} from '../controllers/auth';

const router: Router = Router();

router.post('/appointments',protect, createAppointment);

router.get('/appointments/:id', protect,getAppointments);
router.get('/appointments', protect,getAppointmentall);


router.put('/appointments/:appointmentId', updateAppointment);

export default router;
