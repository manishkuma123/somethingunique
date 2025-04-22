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
exports.updateAppointment = exports.getAppointmentall = exports.getAppointments = exports.createAppointment = void 0;
const appointment_1 = __importDefault(require("../models/appointment"));
const createAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { date, time } = req.body;
        const user = req.user.id;
        const currentDate = new Date();
        const appointmentDate = new Date(date);
        if (appointmentDate < currentDate) {
            return res.status(400).json({ message: 'Appointment cannot be in the past' });
        }
        const newAppointment = new appointment_1.default({
            userId: user,
            date: appointmentDate,
            time,
            status: 'booked',
        });
        yield newAppointment.save();
        res.status(201).json(newAppointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error creating appointment' });
    }
});
exports.createAppointment = createAppointment;
const getAppointments = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { id } = req.params;
    try {
        const appointment = yield appointment_1.default.findById(id);
        if (!appointment) {
            res.status(404).json({ message: "appointment  not found" });
            return;
        }
        res.status(200).json(appointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error fetching appointments' });
    }
});
exports.getAppointments = getAppointments;
// export const getAppointmentall = async (req: any, res: any) => {
//     try {
//       const userId = req.user.id; 
//       const appointments = await Appointment.find({ userId });
//       if (!appointments || appointments.length === 0) {
//         return res.status(404).json({ message: 'no appointment' });
//       }
//       return res.status(404).json(
//         appointments
//     );
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Error fetching appointments' });
//     }
//   };
// export const getAppointmentall = async (req: any, res: any) => {
//     try {
//       const { role, id: userId } = req.user; 
//       if (role === 'admin') {
//         const appointments = await Appointment.find()
//         if (!appointments || appointments.length === 0) {
//           return res.status(404).json({ message: 'No appointments found' });
//         }
//         return res.status(200).json(appointments);
//       }
//       const appointments = await Appointment.find({ userId });
//       if (!appointments || appointments.length === 0) {
//         return res.status(404).json({ message: 'No appointments found' });
//       }
//       return res.status(200).json(appointments);
//     } catch (error) {
//       console.error(error);
//       res.status(500).json({ message: 'Error fetching appointments' });
//     }
//   };
const getAppointmentall = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { role, id: userId } = req.user;
        if (role === 'admin') {
            const appointments = yield appointment_1.default.find().populate('userId', 'username email');
            if (!appointments || appointments.length === 0) {
                return res.status(404).json({ message: 'No appointments found' });
            }
            return res.status(200).json(appointments);
        }
        const appointments = yield appointment_1.default.find({ userId }).populate('userId', 'username email');
        if (!appointments || appointments.length === 0) {
            return res.status(404).json({ message: 'No appointments found' });
        }
        return res.status(200).json(appointments);
    }
    catch (error) {
        console.error(error);
        return res.status(500).json({ message: 'Error fetching appointments' });
    }
});
exports.getAppointmentall = getAppointmentall;
const updateAppointment = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { appointmentId } = req.params;
        const { status } = req.body;
        if (!['booked', 'cancelled', 'completed'].includes(status)) {
            return res.status(400).json({ message: 'Invalid status value' });
        }
        const appointment = yield appointment_1.default.findById(appointmentId);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        appointment.status = status;
        yield appointment.save();
        res.status(200).json(appointment);
    }
    catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Error updating appointment' });
    }
});
exports.updateAppointment = updateAppointment;
