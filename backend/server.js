/**
 * DG Interns Hub - Week 6: Backend Integration & Authentication System
 * Main Express Application Server
 * 
 * Features:
 * - Express REST API
 * - MongoDB Connection (Mongoose)
 * - Security (Helmet, CORS, Rate Limiting)
 * - Static Frontend Serving
 * - Graceful Error Handling
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const dotenv = require('dotenv');

// 1. Load Environment Variables (.env in backend or root)
dotenv.config({ path: path.join(__dirname, '.env') });
dotenv.config({ path: path.join(__dirname, '../.env') });
dotenv.config();

const connectDB = require('./config/db.js');
const authRoutes = require('./routes/auth');
const fs = require('fs');

// 2. Initialize Express App
const app = express();

// 3. Connect to MongoDB Atlas
connectDB();

// 4. Security Middlewares
// Helmet sets various HTTP headers for app security
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow external Google Fonts & inline demo scripts
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration - Allows production frontend on Vercel and local development
const allowedOrigins = [
  'https://access-vault-week-6.vercel.app',
  'http://localhost:5000',
  'http://127.0.0.1:5000',
];

const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, or Postman)
    if (!origin) return callback(null, true);

    const normalizedOrigin = origin.replace(/\/$/, '');
    if (allowedOrigins.includes(normalizedOrigin)) {
      return callback(null, true);
    }
    return callback(null, false);
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));

// Body Parsers for incoming JSON and Form Data
app.use(express.json({ limit: '10kb' }));
app.use(express.urlencoded({ extended: true, limit: '10kb' }));

// 5. Rate Limiting for Authentication Endpoints (Security Best Practice)
// Prevents brute-force credential stuffing and denial of service
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes window
  max: 100, // Limit each IP to 100 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.',
  },
});

// Apply rate limiter specifically to /api/auth routes
app.use('/api/auth', authLimiter);

// 6. Mount Authentication API Routes
app.use('/api/auth', authRoutes);

// 7. Health Check API Endpoint
app.get('/api/health', (req, res) => {
  const mongoose = require('mongoose');
  const dbStatus = mongoose.connection.readyState === 1 ? 'connected' : 'disconnected';
  
  res.status(200).json({
    success: true,
    message: 'AccessVault Authentication Server is healthy & operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'test',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// 8. Serve Frontend Static Files
// Allows accessing the full stack directly via http://localhost:5000/ if frontend exists
const frontendPath = path.join(__dirname, '../frontend');
const hasFrontend = fs.existsSync(frontendPath);

if (hasFrontend) {
  app.use(express.static(frontendPath));
  
  // Explicit route for Root: Serves index.html
  app.get('/', (req, res) => {
    res.sendFile(path.join(frontendPath, 'index.html'));
  });
} else {
  // If running isolated in container, provide friendly JSON greeting at root
  app.get('/', (req, res) => {
    res.status(200).json({
      success: true,
      message: 'AccessVault — Secure User Authentication System Backend API is running!',
      status: 'healthy',
      endpoints: {
        health: '/api/health',
        signup: 'POST /api/auth/signup',
        login: 'POST /api/auth/login',
        me: 'GET /api/auth/me',
        logout: 'POST /api/auth/logout',
      },
    });
  });
}

// 9. 404 Handler for Unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// 10. Fallback for Frontend Single-Page / Direct HTML Navigation
app.get('*', (req, res) => {
  if (hasFrontend && req.accepts('html')) {
    res.sendFile(path.join(frontendPath, 'index.html'));
  } else {
    res.status(404).json({ success: false, message: 'Resource not found' });
  }
});

// 11. Global Error Handling Middleware
app.use((err, req, res, next) => {
  console.error('Unhandled Application Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'An unexpected internal server error occurred.',
  });
});

// 12. Start Server - Listening explicitly on 0.0.0.0
const PORT = process.env.PORT || 5000;
const HOST = '0.0.0.0';

app.listen(PORT, HOST, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 AccessVault — Secure User Authentication System Running!`);
  console.log(`🌐 Local Server URL : http://localhost:${PORT}`);
  console.log(`🌐 Network Bind     : ${HOST}:${PORT}`);
  console.log(`🩺 Health API Check : http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

module.exports = app;
