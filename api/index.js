
const serverless = require('serverless-http');
const express = require('express');
const cors = require('cors');
const app = express();

// CORS FIRST!
const allowedOrigins = [
  'https://salmon-crab-444533.hostingersite.com', // your frontend
  'http://localhost:3000' // local dev
];
const corsOptions = {
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps, curl, etc.)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
};

// Use cors middleware globally
app.use(cors(corsOptions));

// Explicit preflight handler for all routes
app.options('*', cors(corsOptions));

const mongoose = require('mongoose');
const fileUpload = require('express-fileupload');
const cloudinary = require('cloudinary').v2;
require('dotenv').config();

// ...existing code...

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


// Add the root endpoint handler here ▼
app.get('/', (req, res) => {
  res.json({
    status: 'API is working',
    message: 'Welcome to ZORA backend!',
    endpoints: {
      articles: '/api/articles',
      auth: '/api/auth',
      test: '/test'
    }
  });
});



// MongoDB Connection (Prevent Reconnect)
let isConnected = false;
const connectMongo = async () => {
  if (!isConnected) {
    try {
      await mongoose.connect(process.env.MONGO_URI);
      console.log("✅ MongoDB connected!");
      isConnected = true;
    } catch (err) {
      console.error("❌ MongoDB connection error:", err.message);
      throw err; // Crash the app to surface the error
    }
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

if (process.env.NODE_ENV !== 'production') {
  const PORT = 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Local server running: http://localhost:${PORT}`);
  });
}


module.exports = serverless(app);
