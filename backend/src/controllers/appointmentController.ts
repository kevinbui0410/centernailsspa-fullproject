import { Request, Response } from 'express';
import { Appointment } from '../models/Appointment';
import { User } from '../models/User';
import { Service } from '../models/Service';

export const getAppointments = async (req: Request, res: Response) => {
  try {
    const { customer, staff, startDate, endDate } = req.query;
    const query: any = {};
    if (customer) query.customer = customer;
    if (staff) query.staff = staff;
    if (startDate && endDate) {
      query.startTime = { $gte: new Date(startDate as string), $lte: new Date(endDate as string) };
    }
    const appointments = await Appointment.find(query).populate('customer staff service');
    res.json(appointments);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching appointments', error });
  }
};

export const createAppointment = async (req: Request, res: Response) => {
  try {
    const { customer, staff, service, startTime, notes } = req.body;
    const serviceDoc = await Service.findById(service);
    if (!serviceDoc) {
      return res.status(404).json({ message: 'Service not found' });
    }
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + serviceDoc.duration);
    const appointment = new Appointment({
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
  } catch (error) {
    res.status(500).json({ message: 'Error creating appointment', error });
  }
};

export const updateAppointment = async (req: Request, res: Response) => {
  try {
    const { status, notes } = req.body;
    const appointment = await Appointment.findByIdAndUpdate(
      req.params.id,
      { status, notes },
      { new: true }
    );
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json(appointment);
  } catch (error) {
    res.status(500).json({ message: 'Error updating appointment', error });
  }
};

export const deleteAppointment = async (req: Request, res: Response) => {
  try {
    const appointment = await Appointment.findByIdAndDelete(req.params.id);
    if (!appointment) {
      return res.status(404).json({ message: 'Appointment not found' });
    }
    res.json({ message: 'Appointment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting appointment', error });
  }
}; 