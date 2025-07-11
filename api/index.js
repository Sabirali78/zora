const serverless = require('serverless-http');
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;

require('dotenv').config();

const app = express();

// Cloudinary configuration
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
});

// Middleware
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
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// MongoDB Connection (Prevent Reconnect)
let isConnected = false;
const connectMongo = async () => {
  if (!isConnected) {
    await mongoose.connect(process.env.MONGO_URI);
    isConnected = true;
  }
};
connectMongo();


// Register API routes with /api prefix for Vercel serverless routing
app.use('/api/auth', require('../routes/auth'));
app.use('/api/articles', require('../routes/articles'));

app.get('/test', async (req, res) => {
  try {
    await cloudinary.api.ping();
    res.json({
      message: 'Backend is working!',
      cloudinary: 'Connected',
      database: 'Connected'
    });
  } catch (err) {
    res.status(500).json({
      message: 'Backend error',
      cloudinary: err.message
    });
  }
});

module.exports = serverless(app);
