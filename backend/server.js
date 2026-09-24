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

// 1. Load Environment Variables from root .env or local
dotenv.config({ path: path.join(__dirname, '../.env') });
// Also fallback to current directory .env if root is not found
dotenv.config();

const connectDB = require('./config/db.js');
const authRoutes = require('./routes/auth');

// 2. Initialize Express App
const app = express();

// 3. Connect to MongoDB
connectDB();

// 4. Security Middlewares
// Helmet sets various HTTP headers for app security
app.use(
  helmet({
    contentSecurityPolicy: false, // Disabled to allow external Google Fonts & inline demo scripts
    crossOriginEmbedderPolicy: false,
  })
);

// CORS configuration - Allows requests from localhost or external frontend clients
app.use(
  cors({
    origin: true, // Reflect request origin (supports Live Server, ports 5500, 3000, 5000, etc.)
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

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
    message: 'Week 6 Authentication Server is healthy & operational',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    database: {
      status: dbStatus,
      name: mongoose.connection.name || 'week6_auth',
    },
    environment: process.env.NODE_ENV || 'development',
  });
});

// 8. Serve Frontend Static Files
// Allows accessing the full stack directly via http://localhost:5000/
const frontendPath = path.join(__dirname, '../frontend');
app.use(express.static(frontendPath));

// Explicit route for Root: Serves index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(frontendPath, 'index.html'));
});

// 9. 404 Handler for Unmatched API routes
app.all('/api/*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `API endpoint not found: ${req.method} ${req.originalUrl}`,
  });
});

// 10. Fallback for Frontend Single-Page / Direct HTML Navigation
app.get('*', (req, res) => {
  // If request looks like a page request, serve index.html
  if (req.accepts('html')) {
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

// 12. Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`\n======================================================`);
  console.log(`🚀 DG Interns Hub - Week 6 Auth System Server Running!`);
  console.log(`🌐 Local Server URL : http://localhost:${PORT}`);
  console.log(`📄 Frontend Landing : http://localhost:${PORT}/index.html`);
  console.log(`🔐 Login Page       : http://localhost:${PORT}/login.html`);
  console.log(`📝 Signup Page      : http://localhost:${PORT}/signup.html`);
  console.log(`📊 Dashboard Page   : http://localhost:${PORT}/dashboard.html`);
  console.log(`🩺 Health API Check : http://localhost:${PORT}/api/health`);
  console.log(`======================================================\n`);
});

module.exports = app;
