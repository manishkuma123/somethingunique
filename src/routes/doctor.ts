import express, { Request, Response } from 'express';
import DoctorModel from '../models/Doctor';

const router = express.Router();


router.post('/', async (req:any , res: any) => {
  try {
    const { name, specialty, contactInfo, profilePicture, description, availableSlots } = req.body;
    const newDoctor = new DoctorModel({
      name,
      specialty,
      contactInfo,
      profilePicture,
      description,
      availableSlots,
    });
    await newDoctor.save();
    res.status(201).json(newDoctor);
  } catch (error) {
    res.status(500).json({ message: 'Error creating doctor', error });
  }
});


router.get('/', async (req: any, res: any) => {
  try {
    const doctors = await DoctorModel.find();
    res.status(200).json(doctors);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctors', error });
  }
});


router.get('/:id', async (req: any, res: any) => {
  try {
    const doctor = await DoctorModel.findById(req.params.id);
    if (!doctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json(doctor);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching doctor', error });
  }
});


router.patch('/:id', async (req: any, res: any) => {
  try {
    const { name, specialty, contactInfo, profilePicture, description, availableSlots } = req.body;
    const updatedDoctor = await DoctorModel.findByIdAndUpdate(
      req.params.id,
      {
        name,
        specialty,
        contactInfo,
        profilePicture,
        description,
        availableSlots,
      },
      { new: true }
    );

    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor', error });
  }
});

// Update available slots for a doctor
router.patch('/:id/slots', async (req: any, res: any) => {
  try {
    const { availableSlots } = req.body;
    const updatedDoctor = await DoctorModel.findByIdAndUpdate(
      req.params.id,
      { availableSlots },
      { new: true }
    );
    
    if (!updatedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }

    res.status(200).json(updatedDoctor);
  } catch (error) {
    res.status(500).json({ message: 'Error updating doctor slots', error });
  }
});

// Delete a doctor (Admin-only)
router.delete('/:id', async (req: any, res: any) => {
  try {
    const deletedDoctor = await DoctorModel.findByIdAndDelete(req.params.id);
    if (!deletedDoctor) {
      return res.status(404).json({ message: 'Doctor not found' });
    }
    res.status(200).json({ message: 'Doctor deleted successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting doctor', error });
  }
});

export default router;
