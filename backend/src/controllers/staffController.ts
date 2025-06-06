import { Request, Response } from 'express';
import { User } from '../models/User';
import { Service } from '../models/Service';

export const getAllStaff = async (req: Request, res: Response) => {
  try {
    const staff = await User.find({ role: 'staff' }).populate('services');
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error });
  }
};

export const getStaffById = async (req: Request, res: Response) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' }).populate('services');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff', error });
  }
};

export const getStaffServices = async (req: Request, res: Response) => {
  try {
    const staff = await User.findOne({ _id: req.params.id, role: 'staff' }).populate('services');
    if (!staff) {
      return res.status(404).json({ message: 'Staff not found' });
    }
    res.json(staff.services);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching staff services', error });
  }
}; 