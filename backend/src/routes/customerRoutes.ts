import express from 'express';
import { 
  getCustomers, 
  getCustomer, 
  createCustomer, 
  updateCustomer, 
  deleteCustomer 
} from '../controllers/customerController';
import { authenticateToken, isAdmin } from '../middleware/auth';

const router = express.Router();

// All routes are protected and require admin access
router.use(authenticateToken, isAdmin);

// GET /api/customers - Get all customers with pagination
router.get('/', getCustomers);

// GET /api/customers/:id - Get a single customer
router.get('/:id', getCustomer);

// POST /api/customers - Create a new customer
router.post('/', createCustomer);

// PUT /api/customers/:id - Update a customer
router.put('/:id', updateCustomer);

// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', deleteCustomer);

export default router; 