/**
 * DG Interns Hub - Week 6: Authentication System
 * Database Configuration (Mongoose + MongoDB)
 * 
 * This module connects our Node.js/Express backend to the MongoDB database
 * running inside our Docker container (or local instance).
 */

const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/week6_auth';

    console.log('🔄 Attempting to connect to MongoDB...');

    const conn = await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000, // Timeout after 5 seconds instead of hanging
    });

    console.log(`✅ MongoDB Connected successfully! Host: ${conn.connection.host}, Database: ${conn.connection.name}`);
  } catch (error) {
    console.error('❌ MongoDB Connection Error:', error.message);
    console.error('\n💡 Troubleshooting Tips for Student/Evaluator:');
    console.error('   1. Verify your MONGODB_URI connection string in .env / backend/.env.');
    console.error('   2. Ensure your IP address is whitelisted in MongoDB Atlas (Network Access -> Add 0.0.0.0/0).');
    console.error('   3. Check your database username and password in the Atlas URI.');
    console.error('   4. Ensure the Docker container has active internet connectivity.\n');
    
    // In production we exit on failure; in dev we allow the server to start so health/status routes still work
    if (process.env.NODE_ENV === 'production') {
      process.exit(1);
    }
  }
};

// Handle connection events
mongoose.connection.on('disconnected', () => {
  console.warn('⚠️  MongoDB disconnected.');
});

mongoose.connection.on('reconnected', () => {
  console.log('🔄 MongoDB reconnected successfully.');
});

// Handle graceful shutdown
process.on('SIGINT', async () => {
  await mongoose.connection.close();
  console.log('🔒 MongoDB connection closed due to app termination');
  process.exit(0);
});

module.exports = connectDB;
