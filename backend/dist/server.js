"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const db_1 = require("./config/db");
const appointmentRoutes_1 = __importDefault(require("./routes/appointmentRoutes"));
const serviceRoutes_1 = __importDefault(require("./routes/serviceRoutes"));
const staffRoutes_1 = __importDefault(require("./routes/staffRoutes"));
const customerRoutes_1 = __importDefault(require("./routes/customerRoutes"));
const adminRoutes_1 = __importDefault(require("./routes/adminRoutes"));
const uploadRoutes_1 = __importDefault(require("./routes/uploadRoutes"));
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const app = (0, express_1.default)();
// Connect to MongoDB
(0, db_1.connectDB)();
// Middleware
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use(express_1.default.urlencoded({ extended: true }));
// Serve static files from uploads directory
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, '../uploads')));
// Routes
app.use('/api/auth', authRoutes_1.default);
app.use('/api/appointments', appointmentRoutes_1.default);
app.use('/api/services', serviceRoutes_1.default);
app.use('/api/staff', staffRoutes_1.default);
app.use('/api/customers', customerRoutes_1.default);
app.use('/api/admin', adminRoutes_1.default);
app.use('/api/upload', uploadRoutes_1.default);
// Basic route
app.get('/', (req, res) => {
    res.json({ message: 'Welcome to CenterNailsSpa API' });
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
