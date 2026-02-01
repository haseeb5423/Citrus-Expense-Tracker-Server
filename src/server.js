import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import cookieParser from 'cookie-parser';
import { logger } from './utils/logger.js';
import { errorHandler, notFoundHandler } from './middleware/errorHandler.js';
import { apiLimiter } from './middleware/rateLimiter.js';

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
  'http://localhost:3001',
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

// Request logging
app.use(logger.requestLogger());

// Rate limiting for API routes
app.use('/api', apiLimiter);

/* ================================
   VIEW ENGINE
================================ */

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, '../views'));

/* ================================
   DATABASE CONNECTION
================================ */

logger.info('Attempting MongoDB connection...');

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => logger.info('✓ MongoDB Connected Successfully'))
  .catch((err) => {
    logger.error('MongoDB Connection Error:', { error: err.message });
    process.exit(1);
  });

mongoose.connection.on('connected', () => {
  logger.info('Mongoose connected to database');
});

mongoose.connection.on('error', (err) => {
  logger.error('Mongoose connection error:', { error: err.message });
});

mongoose.connection.on('disconnected', () => {
  logger.warn('Mongoose disconnected from database');
});

process.on('SIGINT', async () => {
  await mongoose.connection.close();
  logger.info('Mongoose connection closed due to application termination');
  process.exit(0);
});

process.on('unhandledRejection', (err) => {
  logger.error('Unhandled Promise Rejection:', { error: err.message, stack: err.stack });
  process.exit(1);
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

// Health check endpoint  
app.get('/health', (req, res) => {
  const health = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    environment: process.env.NODE_ENV || 'development'
  };
  
  res.status(200).json(health);
});

/* ================================
   ERROR HANDLING
================================ */

// 404 handler - must be after all routes
app.use(notFoundHandler);

// Global error handler - must be last
app.use(errorHandler);

/* ================================
   SERVER START
================================ */

app.listen(PORT, () => {
  logger.info(`🚀 Server running on port ${PORT}`, {
    environment: process.env.NODE_ENV || 'development',
    port: PORT
  });
});
