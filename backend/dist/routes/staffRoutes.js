"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const staffController_1 = require("../controllers/staffController");
const router = express_1.default.Router();
// GET /api/staff
router.get('/', staffController_1.getAllStaff);
// GET /api/staff/:id
router.get('/:id', staffController_1.getStaffById);
// GET /api/staff/:id/services
router.get('/:id/services', staffController_1.getStaffServices);
exports.default = router;
