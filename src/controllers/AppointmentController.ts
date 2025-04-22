import { Request, Response } from 'express';
import Appointment from '../models/appointment';
import { app } from '../socket';


export const createAppointment = async (req: any, res: any) => {
  try {
    const {  date, time } = req.body;
    const  user = req.user.id; 
 
    const currentDate = new Date();
    const appointmentDate = new Date(date);

    if (appointmentDate < currentDate) {
      return res.status(400).json({ message: 'Appointment cannot be in the past' });
    }

   
    const newAppointment = new Appointment({
      userId:user,
      date: appointmentDate,
      time,
      status: 'booked',
    });

    await newAppointment.save();
    res.status(201).json(newAppointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error creating appointment' });
  }
};


export const getAppointments = async (req: any, res: any) => {
    const {id} = req.params;
  try {
    const appointment =  await Appointment.findById(id) 
    if(!appointment ){
        res.status(404).json({ message: "appointment  not found" });
        return;
    }
    res.status(200).json(appointment );

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error fetching appointments' });
  }
};
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
  

export const getAppointmentall = async (req: any, res: any) => {
  try {
    
    const { role, id: userId } = req.user;

    if (role === 'admin') {
    
      const appointments = await Appointment.find().populate('userId', 'username email');
      if (!appointments || appointments.length === 0) {
        return res.status(404).json({ message: 'No appointments found' });
      }
      return res.status(200).json(appointments);
    }


    const appointments = await Appointment.find({ userId }).populate('userId', 'username email');
    if (!appointments || appointments.length === 0) {
      return res.status(404).json({ message: 'No appointments found' });
    }

    return res.status(200).json(appointments);

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error fetching appointments' });
  }
};

export const updateAppointment = async (req:any, res:any) => {
  try {
    const { appointmentId } = req.params;
    const { status } = req.body;

    
    if (!['booked', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    
    const appointment = await Appointment.findById(appointmentId);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }

    appointment.status = status;
    await appointment.save();

    res.status(200).json(appointment);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Error updating appointment' });
  }
};
