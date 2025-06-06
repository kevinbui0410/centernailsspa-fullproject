import express from 'express';
import { getAppointments, createAppointment, updateAppointment, deleteAppointment } from '../controllers/appointmentController';

const router = express.Router();

// GET /api/appointments
router.get('/', getAppointments);

// POST /api/appointments
router.post('/', createAppointment);

// PATCH /api/appointments/:id
router.patch('/:id', updateAppointment);

// DELETE /api/appointments/:id
router.delete('/:id', deleteAppointment);

export default router; 