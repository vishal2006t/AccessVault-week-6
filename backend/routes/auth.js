/**
 * DG Interns Hub - Week 6: Authentication System
 * Authentication Routes & Controllers
 * 
 * Endpoints:
 * - POST /api/auth/signup  : Register a new user
 * - POST /api/auth/login   : Authenticate user & issue JWT
 * - GET  /api/auth/me      : Retrieve current authenticated user (Protected)
 * - POST /api/auth/logout  : Invalidate client-side session
 */

const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const { protect } = require('../middleware/auth');

/**
 * Helper Function: Generate JSON Web Token (JWT)
 * Signs a payload containing the user ID using the secret key from .env
 */
const generateToken = (userId) => {
  const secret = process.env.JWT_SECRET || 'dg_interns_hub_week6_super_secure_jwt_secret_key_2026';
  const expiresIn = process.env.JWT_EXPIRES_IN || '1d';
  return jwt.sign({ id: userId }, secret, { expiresIn });
};

/**
 * Helper Function: Comprehensive Password Validation Rule
 * Requirements:
 * - Minimum 8 characters
 * - At least 1 uppercase letter (A-Z)
 * - At least 1 lowercase letter (a-z)
 * - At least 1 special character (e.g. @, #, $, %, !)
 */
const validatePassword = (password) => {
  if (!password) {
    return {
      isValid: false,
      message: 'Password is required.',
      missing: ['Password is required'],
    };
  }

  const missing = [];
  if (password.length < 8) {
    missing.push('at least 8 characters');
  }
  if (!/[A-Z]/.test(password)) {
    missing.push('at least 1 uppercase letter (A-Z)');
  }
  if (!/[a-z]/.test(password)) {
    missing.push('at least 1 lowercase letter (a-z)');
  }
  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?`~]/.test(password)) {
    missing.push('at least 1 special character (for example: @, #, $, %, !)');
  }

  if (missing.length > 0) {
    return {
      isValid: false,
      message: `Password must contain ${missing.join(', ')}.`,
      missing,
    };
  }

  return { isValid: true, message: '', missing: [] };
};

/**
 * Helper Function: Basic Email Regex Validation
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// ==========================================
// 1. SIGNUP: POST /api/auth/signup
// ==========================================
router.post('/signup', async (req, res) => {
  try {
    const { name, email, password, confirmPassword } = req.body;

    // A. Validate missing fields
    if (!name || !email || !password || !confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Please provide all required fields: name, email, password, and confirm password.',
      });
    }

    const trimmedName = name.trim();
    const normalizedEmail = email.trim().toLowerCase();

    // B. Validate Name length
    if (trimmedName.length < 2) {
      return res.status(400).json({
        success: false,
        message: 'Full Name must be at least 2 characters long.',
      });
    }

    // C. Validate Email format
    if (!isValidEmail(normalizedEmail)) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid email address (e.g., student@example.com).',
      });
    }

    // D. Validate Password complexity rules (min 8 chars, uppercase, lowercase, special char)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    // E. Validate Password match
    if (password !== confirmPassword) {
      return res.status(400).json({
        success: false,
        message: 'Passwords do not match. Please re-enter identical passwords.',
      });
    }

    // F. Check if user already exists (duplicate email)
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists. Please log in instead.',
      });
    }

    // G. Create new user (password is automatically hashed via UserSchema pre-save hook)
    const newUser = await User.create({
      name: trimmedName,
      email: normalizedEmail,
      password,
    });

    // H. Generate JWT token
    const token = generateToken(newUser._id);

    // I. Return success response (newUser.toJSON automatically excludes password)
    return res.status(201).json({
      success: true,
      message: 'Account created successfully! Welcome to AccessVault.',
      token,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error) {
    console.error('Signup Error:', error);

    // Handle MongoDB duplicate key error code 11000 defensively
    if (error.code === 11000) {
      return res.status(409).json({
        success: false,
        message: 'An account with this email address already exists.',
      });
    }

    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const messages = Object.values(error.errors).map((val) => val.message);
      return res.status(400).json({
        success: false,
        message: messages.join('. '),
      });
    }

    return res.status(500).json({
      success: false,
      message: 'Internal server error while processing signup. Please try again later.',
    });
  }
});

// ==========================================
// 2. LOGIN: POST /api/auth/login
// ==========================================
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // A. Validate missing fields
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Please provide both email and password.',
      });
    }

    // B. Validate Password complexity rules (min 8 chars, uppercase, lowercase, special char)
    const passwordValidation = validatePassword(password);
    if (!passwordValidation.isValid) {
      return res.status(400).json({
        success: false,
        message: passwordValidation.message,
      });
    }

    const normalizedEmail = email.trim().toLowerCase();

    // C. Find user in database
    const user = await User.findOne({ email: normalizedEmail });
    if (!user) {
      // Use uniform message for security (don't reveal whether email or password was wrong)
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // C. Verify password using bcrypt compare method
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    // D. Generate JWT token
    const token = generateToken(user._id);

    // E. Return successful response
    return res.status(200).json({
      success: true,
      message: 'Login successful! Redirecting to Dashboard...',
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        createdAt: user.createdAt,
      },
    });
  } catch (error) {
    console.error('Login Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error during login. Please try again later.',
    });
  }
});

// ==========================================
// 3. GET CURRENT USER: GET /api/auth/me (Protected)
// ==========================================
router.get('/me', protect, async (req, res) => {
  try {
    // req.user is set by the protect middleware after verifying JWT
    return res.status(200).json({
      success: true,
      message: 'User authenticated successfully.',
      user: {
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        createdAt: req.user.createdAt,
        updatedAt: req.user.updatedAt,
      },
    });
  } catch (error) {
    console.error('Auth /me Error:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve user profile.',
    });
  }
});

// ==========================================
// 4. LOGOUT: POST /api/auth/logout
// ==========================================
router.post('/logout', (req, res) => {
  // With stateless JWT tokens, client clears the token from localStorage
  return res.status(200).json({
    success: true,
    message: 'Logged out successfully.',
  });
});

module.exports = router;
