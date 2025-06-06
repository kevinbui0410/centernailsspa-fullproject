"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getServiceById = exports.getAllServices = void 0;
const Service_1 = require("../models/Service");
const getAllServices = async (req, res) => {
    try {
        const services = await Service_1.Service.find({ isActive: true });
        res.json(services);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching services', error });
    }
};
exports.getAllServices = getAllServices;
const getServiceById = async (req, res) => {
    try {
        const service = await Service_1.Service.findById(req.params.id);
        if (!service) {
            return res.status(404).json({ message: 'Service not found' });
        }
        res.json(service);
    }
    catch (error) {
        res.status(500).json({ message: 'Error fetching service', error });
    }
};
exports.getServiceById = getServiceById;
