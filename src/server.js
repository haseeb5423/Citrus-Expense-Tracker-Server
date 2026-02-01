import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.set('trust proxy', 1); // Trust first proxy (required for secure cookies on Heroku/Vercel/etc)
const PORT = process.env.PORT || 5000;

/* ================================
   CORS CONFIG (IMPORTANT)
================================ */

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'https://citrus-expense-tracker.web.app',
  'https://citrus-expense-tracker.firebaseapp.com',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow server-to-server & Postman requests (no origin)
    if (!origin) return callback(null, true);

    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    }

    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
};

// Apply CORS middleware
app.use(cors(corsOptions));

// Handle preflight explicitly using the SAME options
app.options('*', cors(corsOptions));

/* ================================
   MIDDLEWARE
================================ */

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* ================================
   VIEW ENGINE
================================ */

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

/* ================================
   DATABASE CONNECTION
================================ */

console.log('Attempting MongoDB connection...');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log('MongoDB Connected'))
  .catch((err) => console.error('MongoDB Connection Error:', err));

mongoose.connection.on('connected', () => {
  console.log('Mongoose connected:', process.env.MONGO_URI);
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose error:', err);
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('Mongoose closed on app termination');
  process.exit(0);
});

/* ================================
   ROUTES
================================ */

import authRoutes from './routes/authRoutes.js';
import financeRoutes from './routes/financeRoutes.js';

app.use('/api/auth', authRoutes);
app.use('/api/finance', financeRoutes);

/* ================================
   STATUS ROUTES
================================ */

app.get('/status', (req, res) => {
  const dbStatus = mongoose.connection.readyState === 1;
  res.render('status', { dbStatus, port: PORT });
});

app.get('/', (req, res) => {
  res.redirect('/status');
});

/* ================================
   SERVER START
================================ */

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
