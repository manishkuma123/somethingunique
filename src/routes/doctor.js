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
const express_1 = __importDefault(require("express"));
const Doctor_1 = __importDefault(require("../models/Doctor"));
const router = express_1.default.Router();
router.post('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, specialty, contactInfo, profilePicture, description, availableSlots } = req.body;
        const newDoctor = new Doctor_1.default({
            name,
            specialty,
            contactInfo,
            profilePicture,
            description,
            availableSlots,
        });
        yield newDoctor.save();
        res.status(201).json(newDoctor);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating doctor', error });
    }
}));
router.get('/', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctors = yield Doctor_1.default.find();
        res.status(200).json(doctors);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching doctors', error });
    }
}));
router.get('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const doctor = yield Doctor_1.default.findById(req.params.id);
        if (!doctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json(doctor);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching doctor', error });
    }
}));
router.patch('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { name, specialty, contactInfo, profilePicture, description, availableSlots } = req.body;
        const updatedDoctor = yield Doctor_1.default.findByIdAndUpdate(req.params.id, {
            name,
            specialty,
            contactInfo,
            profilePicture,
            description,
            availableSlots,
        }, { new: true });
        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json(updatedDoctor);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating doctor', error });
    }
}));
// Update available slots for a doctor
router.patch('/:id/slots', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const { availableSlots } = req.body;
        const updatedDoctor = yield Doctor_1.default.findByIdAndUpdate(req.params.id, { availableSlots }, { new: true });
        if (!updatedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json(updatedDoctor);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating doctor slots', error });
    }
}));
// Delete a doctor (Admin-only)
router.delete('/:id', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const deletedDoctor = yield Doctor_1.default.findByIdAndDelete(req.params.id);
        if (!deletedDoctor) {
            return res.status(404).json({ message: 'Doctor not found' });
        }
        res.status(200).json({ message: 'Doctor deleted successfully' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting doctor', error });
    }
}));
exports.default = router;
