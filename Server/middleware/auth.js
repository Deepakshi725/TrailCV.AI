import jwt from 'jsonwebtoken';
import { Users } from '../models/User.js';

export const auth = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await Users.findOne({ email: decoded.email });

    if (!user) {
      return res.status(401).json({ error: 'User not found' });
    }

    // Set user ID in request object
    req.user = {
      id: user._id,
      email: user.email
    };

    next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    res.status(401).json({ error: 'Please authenticate' });
  }
}; 