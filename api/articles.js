const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

const app = express();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

app.use(express.json());
app.use(fileUpload({
  useTempFiles: true,
  tempFileDir: '/tmp/'
}));

app.use(cors({
  origin: [
    'https://salmon-crab-444533.hostingersite.com',
    process.env.FRONTEND_URL || 'http://localhost:3000'
  ],
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// MongoDB Connection (Prevent Reconnect)


let isConnected = false;
const connectMongo = async () => {
  if (isConnected) return;
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGO_URI, {
      serverSelectionTimeoutMS: 10000 // 10 seconds
    });
    isConnected = true;
    console.log('MongoDB connected!');
  } catch (err) {
    console.error('MongoDB connection error:', err);
    throw err;
  }
};

// Ensure MongoDB connection for every request, with error handling
app.use(async (req, res, next) => {
  try {
    await connectMongo();
    next();
  } catch (err) {
    res.status(500).json({ message: 'MongoDB connection failed', error: err.message });
  }
});

// Register only the articles routes at root
app.use('/', require('../routes/articles'));

module.exports = serverless(app);
