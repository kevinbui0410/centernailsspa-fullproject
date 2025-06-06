"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const customerController_1 = require("../controllers/customerController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All routes are protected and require admin access
router.use(auth_1.authenticateToken, auth_1.isAdmin);
// GET /api/customers - Get all customers with pagination
router.get('/', customerController_1.getCustomers);
// GET /api/customers/:id - Get a single customer
router.get('/:id', customerController_1.getCustomer);
// POST /api/customers - Create a new customer
router.post('/', customerController_1.createCustomer);
// PUT /api/customers/:id - Update a customer
router.put('/:id', customerController_1.updateCustomer);
// DELETE /api/customers/:id - Delete a customer
router.delete('/:id', customerController_1.deleteCustomer);
exports.default = router;
