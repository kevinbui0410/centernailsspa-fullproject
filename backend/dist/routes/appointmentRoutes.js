"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const appointmentController_1 = require("../controllers/appointmentController");
const router = express_1.default.Router();
// GET /api/appointments
router.get('/', appointmentController_1.getAppointments);
// POST /api/appointments
router.post('/', appointmentController_1.createAppointment);
// PATCH /api/appointments/:id
router.patch('/:id', appointmentController_1.updateAppointment);
// DELETE /api/appointments/:id
router.delete('/:id', appointmentController_1.deleteAppointment);
exports.default = router;
