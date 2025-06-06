import express from 'express';
import { getAllServices, getServiceById } from '../controllers/serviceController';

const router = express.Router();

// GET /api/services
router.get('/', getAllServices);

// GET /api/services/:id
router.get('/:id', getServiceById);

export default router; 