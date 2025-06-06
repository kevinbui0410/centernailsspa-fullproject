"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.deleteAppointment = exports.updateAppointment = exports.createAppointment = exports.getAppointments = void 0;
const Appointment_1 = require("../models/Appointment");
const Service_1 = require("../models/Service");
const getAppointments = async (req, res) => {
    try {
        const { customer, staff, startDate, endDate } = req.query;
        const query = {};
        if (customer)
            query.customer = customer;
        if (staff)
            query.staff = staff;
        if (startDate && endDate) {
            query.startTime = { $gte: new Date(startDate), $lte: new Date(endDate) };
        }
        const appointments = await Appointment_1.Appointment.find(query).populate('customer staff service');
        res.json(appointments);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching appointments', error });
    }
};
exports.getAppointments = getAppointments;
const createAppointment = async (req, res) => {
    try {
        const { customer, staff, service, startTime, notes } = req.body;
        const serviceDoc = await Service_1.Service.findById(service);
        if (!serviceDoc) {
            return res.status(404).json({ message: 'Service not found' });
        }
        const endTime = new Date(startTime);
        endTime.setMinutes(endTime.getMinutes() + serviceDoc.duration);
        const appointment = new Appointment_1.Appointment({
            customer,
            staff,
            service,
            startTime,
            endTime,
            notes,
            status: 'pending'
        });
        await appointment.save();
        res.status(201).json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error creating appointment', error });
    }
};
exports.createAppointment = createAppointment;
const updateAppointment = async (req, res) => {
    try {
        const { status, notes } = req.body;
        const appointment = await Appointment_1.Appointment.findByIdAndUpdate(req.params.id, { status, notes }, { new: true });
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json(appointment);
    }
    catch (error) {
        res.status(500).json({ message: 'Error updating appointment', error });
    }
};
exports.updateAppointment = updateAppointment;
const deleteAppointment = async (req, res) => {
    try {
        const appointment = await Appointment_1.Appointment.findByIdAndDelete(req.params.id);
        if (!appointment) {
            return res.status(404).json({ message: 'Appointment not found' });
        }
        res.json({ message: 'Appointment deleted' });
    }
    catch (error) {
        res.status(500).json({ message: 'Error deleting appointment', error });
    }
};
exports.deleteAppointment = deleteAppointment;
