import express from 'express';
import { getAllStaff, getStaffById, getStaffServices } from '../controllers/staffController';

const router = express.Router();

// GET /api/staff
router.get('/', getAllStaff);

// GET /api/staff/:id
router.get('/:id', getStaffById);

// GET /api/staff/:id/services
router.get('/:id/services', getStaffServices);

export default router; 