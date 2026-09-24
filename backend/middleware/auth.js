/**
 * DG Interns Hub - Week 6: Authentication System
 * JWT Authentication Middleware
 * 
 * Protects private routes by verifying the JSON Web Token (JWT) sent
 * in the HTTP Authorization header: "Bearer <token>"
 */

const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
  let token;

  // 1. Check for Authorization header starting with "Bearer"
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer ')
  ) {
    token = req.headers.authorization.split(' ')[1];
  }

  // 2. Reject request if no token was provided
  if (!token) {
    return res.status(401).json({
      success: false,
      message: 'Access denied. No authentication token provided. Please log in.',
    });
  }

  try {
    // 3. Verify the token using our secret key
    const secret = process.env.JWT_SECRET || 'dg_interns_hub_week6_super_secure_jwt_secret_key_2026';
    const decoded = jwt.verify(token, secret);

    // 4. Fetch the user from MongoDB using the ID embedded in the JWT payload
    // Exclude password field as an extra layer of security
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid session. The user belonging to this token no longer exists.',
      });
    }

    // 5. Attach the authenticated user to the request object and proceed
    req.user = user;
    next();
  } catch (error) {
    // 6. Handle specific JWT verification errors
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Your authentication token has expired. Please log in again.',
      });
    }

    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Invalid authentication token signature.',
      });
    }

    return res.status(401).json({
      success: false,
      message: 'Authentication failed. Please log in again.',
    });
  }
};

module.exports = { protect };
