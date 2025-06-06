import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

export const authenticateToken = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ message: 'No token provided' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as any;
    const user = await User.findById(decoded.userId).select('-password');

    if (!user) {
      return res.status(401).json({ message: 'User not found' });
    }

    if (user.status !== 'active') {
      return res.status(403).json({ message: 'User account is inactive' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Invalid token' });
  }
};

export const isAdmin = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Admin privileges required.' });
  }
  next();
};

export const isStaff = (req: Request, res: Response, next: NextFunction) => {
  if (req.user?.role !== 'staff' && req.user?.role !== 'admin') {
    return res.status(403).json({ message: 'Access denied. Staff privileges required.' });
  }
  next();
};

export const isStaffOrSelf = (req: Request, res: Response, next: NextFunction) => {
  const requestedUserId = req.params.id;
  
  if (req.user?.role === 'admin') {
    return next();
  }

  if (req.user?.role === 'staff') {
    return next();
  }

  if (req.user?._id.toString() === requestedUserId) {
    return next();
  }

  return res.status(403).json({ message: 'Access denied' });
}; 