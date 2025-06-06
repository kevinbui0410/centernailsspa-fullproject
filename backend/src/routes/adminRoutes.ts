import express from 'express';
import {
  getDashboardStats,
  getServices,
  getUsers,
  getStaff,
  getAppointments,
  createStaff,
  updateStaff,
  deleteStaff,
  createCustomer,
  updateCustomer,
  deleteCustomer,
  createService,
  updateService,
  deleteService,
  createAppointment,
  updateAppointment,
  deleteAppointment
} from '../controllers/adminController';
import { authenticateToken, isAdmin, isStaff } from '../middleware/auth';

const router = express.Router();

// All admin routes require authentication
router.use(authenticateToken);

// Admin-only routes
router.get('/dashboard', isAdmin, getDashboardStats);
router.get('/users', isAdmin, getUsers);
router.get('/staff', isAdmin, getStaff);
router.post('/staff', isAdmin, createStaff);
router.put('/staff/:id', isAdmin, updateStaff);
router.delete('/staff/:id', isAdmin, deleteStaff);
router.post('/customers', isAdmin, createCustomer);
router.put('/customers/:id', isAdmin, updateCustomer);
router.delete('/customers/:id', isAdmin, deleteCustomer);
router.post('/services', isAdmin, createService);
router.put('/services/:id', isAdmin, updateService);
router.delete('/services/:id', isAdmin, deleteService);
router.post('/appointments', isAdmin, createAppointment);
router.put('/appointments/:id', isAdmin, updateAppointment);
router.delete('/appointments/:id', isAdmin, deleteAppointment);

// Staff and admin routes
router.get('/services', isStaff, getServices);
router.get('/appointments', isStaff, getAppointments);

export default router; 