import express from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { Account } from '../models/Account.js';
import { AccountType } from '../models/AccountType.js';
import { protect } from '../middleware/authMiddleware.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { validateRegistration, validateLogin } from '../middleware/validation.js';
import { asyncHandler } from '../middleware/errorHandler.js';

const router = express.Router();

const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const sendTokenResponse = (user, statusCode, res) => {
  const token = generateToken(user._id);

  const options = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production', // Set to true in production
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
  };

  res.status(statusCode)
    .cookie('token', token, options)
    .json({
      success: true,
      id: user._id,
      name: user.name,
      email: user.email,
      avatar: user.avatar,
      token // Optional: keep sending token in body for now, but cookie is primary
    });
};

router.post('/register', authLimiter, validateRegistration, asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const userExists = await User.findOne({ email });
  if (userExists) {
    return res.status(400).json({ message: 'User already exists with this email' });
  }

  const user = await User.create({ name, email, password });

  // Seed default data
  try {
    // 1. Create Default Account Types
    const defaultTypes = [
      { label: 'Family', theme: 'indigo' },
      { label: 'Salary', theme: 'emerald' },
      { label: 'Current', theme: 'blue' },
      { label: 'Savings', theme: 'orange' }
    ];

    await AccountType.insertMany(
      defaultTypes.map(t => ({ user: user._id, ...t }))
    );

    // 2. Create Default Accounts (Vaults)
    const defaultAccounts = [
      {
        name: 'Family Vault',
        type: 'Family', 
        balance: 0,
        cardNumber: '**** **** **** 1001',
        cardHolder: name.toUpperCase(),
        color: 'indigo'
      },
      {
        name: 'Salary Account', 
        type: 'Salary',
        balance: 0,
        cardNumber: '**** **** **** 2002',
        cardHolder: name.toUpperCase(),
        color: 'emerald'
      },
      {
        name: 'Current Account',
        type: 'Current',
        balance: 0,
        cardNumber: '**** **** **** 3003',
        cardHolder: name.toUpperCase(),
        color: 'blue'
      },
      {
        name: 'Savings Goal',
        type: 'Savings',
        balance: 0,
        cardNumber: '**** **** **** 4004',
        cardHolder: name.toUpperCase(),
        color: 'orange'
      }
    ];

    await Account.insertMany(
      defaultAccounts.map(a => ({ user: user._id, ...a }))
    );

  } catch (error) {
    console.error('Seeding error:', error);
    // Non-blocking, proceed with registration response
  }

  sendTokenResponse(user, 201, res);
}));

router.post('/login', authLimiter, validateLogin, asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  
  if (!user || !(await user.matchPassword(password))) {
    return res.status(401).json({ message: 'Invalid email or password' });
  }

  sendTokenResponse(user, 200, res);
}));

router.post('/logout', (req, res) => {
  // Must use the same options as when cookie was set for proper clearing
  res.cookie('token', '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    expires: new Date(0), // Expire immediately
    maxAge: 0,
  });
  res.status(200).json({ success: true, data: {} });
});

router.get('/me', protect, asyncHandler(async (req, res) => {
  // Edge Caching: Cache session check at Edge for performance
  res.setHeader(
    'Cache-Control',
    's-maxage=60, stale-while-revalidate=300'
  );
  res.json(req.user);
}));

export default router;
