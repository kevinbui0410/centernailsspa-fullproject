import express from 'express';
import cors from 'cors';
import path from 'path';
import { connectDB } from './config/db';
import appointmentRoutes from './routes/appointmentRoutes';
import serviceRoutes from './routes/serviceRoutes';
import staffRoutes from './routes/staffRoutes';
import customerRoutes from './routes/customerRoutes';
import adminRoutes from './routes/adminRoutes';
import uploadRoutes from './routes/uploadRoutes';
import authRoutes from './routes/authRoutes';

const app = express();

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/appointments', appointmentRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/staff', staffRoutes);
app.use('/api/customers', customerRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/upload', uploadRoutes);

// Basic route
app.get('/', (req, res) => {
  res.json({ message: 'Welcome to CenterNailsSpa API' });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 