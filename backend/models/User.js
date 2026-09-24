/**
 * DG Interns Hub - Week 6: Authentication System
 * User Model (Mongoose Schema)
 * 
 * Schema Structure:
 * User
 * ├── name
 * ├── email
 * ├── password (bcrypt hashed)
 * └── createdAt / updatedAt (timestamps)
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Full Name is required'],
      trim: true,
      minlength: [2, 'Name must be at least 2 characters long'],
      maxlength: [50, 'Name cannot exceed 50 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email address is required'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
        'Please enter a valid email address (e.g. user@example.com)',
      ],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters long'],
    },
  },
  {
    timestamps: true, // Automatically manages createdAt and updatedAt fields
  }
);

/**
 * Pre-save Middleware (Hook)
 * Automatically hashes the user's password before saving into MongoDB.
 * Uses bcryptjs with a salt factor of 10.
 * Never hashes if the password hasn't been changed.
 */
userSchema.pre('save', async function (next) {
  // Only hash the password if it has been modified (or is new)
  if (!this.isModified('password')) {
    return next();
  }

  try {
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

/**
 * Instance Method: comparePassword
 * Compares candidate plain-text password with the stored bcrypt hash.
 * Returns true if matching, false otherwise.
 */
userSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

/**
 * Security Safeguard: toJSON Transform
 * Strips out 'password' and '__v' whenever the User document is converted to JSON.
 * This guarantees the bcrypt hash is NEVER accidentally returned in an API response.
 */
userSchema.methods.toJSON = function () {
  const userObject = this.toObject();
  delete userObject.password;
  delete userObject.__v;
  return userObject;
};

const User = mongoose.model('User', userSchema);

module.exports = User;
