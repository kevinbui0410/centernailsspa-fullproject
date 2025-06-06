"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const adminController_1 = require("../controllers/adminController");
const auth_1 = require("../middleware/auth");
const router = express_1.default.Router();
// All admin routes require authentication
router.use(auth_1.authenticateToken);
// Admin-only routes
router.get('/dashboard', auth_1.isAdmin, adminController_1.getDashboardStats);
router.get('/users', auth_1.isAdmin, adminController_1.getUsers);
router.get('/staff', auth_1.isAdmin, adminController_1.getStaff);
router.post('/staff', auth_1.isAdmin, adminController_1.createStaff);
router.put('/staff/:id', auth_1.isAdmin, adminController_1.updateStaff);
router.delete('/staff/:id', auth_1.isAdmin, adminController_1.deleteStaff);
router.post('/customers', auth_1.isAdmin, adminController_1.createCustomer);
router.put('/customers/:id', auth_1.isAdmin, adminController_1.updateCustomer);
router.delete('/customers/:id', auth_1.isAdmin, adminController_1.deleteCustomer);
router.post('/services', auth_1.isAdmin, adminController_1.createService);
router.put('/services/:id', auth_1.isAdmin, adminController_1.updateService);
router.delete('/services/:id', auth_1.isAdmin, adminController_1.deleteService);
router.post('/appointments', auth_1.isAdmin, adminController_1.createAppointment);
router.put('/appointments/:id', auth_1.isAdmin, adminController_1.updateAppointment);
router.delete('/appointments/:id', auth_1.isAdmin, adminController_1.deleteAppointment);
// Staff and admin routes
router.get('/services', auth_1.isStaff, adminController_1.getServices);
router.get('/appointments', auth_1.isStaff, adminController_1.getAppointments);
exports.default = router;
