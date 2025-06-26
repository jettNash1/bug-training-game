// Add polyfill for SlowBuffer in Node.js 24+
if (!global.SlowBuffer && Buffer.from) {
  global.SlowBuffer = Buffer.from;
  if (!global.SlowBuffer.prototype) {
    global.SlowBuffer.prototype = Buffer.prototype;
  }
}

// Update any relative path references
require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: '.env' });

// Add this after dotenv config to debug environment variables
console.log('Environment check:', {
    nodeEnv: process.env.NODE_ENV,
    hasAdminUser: !!process.env.ADMIN_USERNAME,
    hasAdminPass: !!process.env.ADMIN_PASSWORD,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasJwtRefreshSecret: !!process.env.JWT_REFRESH_SECRET,
    port: process.env.PORT,
    mongoUri: process.env.MONGODB_URI ? process.env.MONGODB_URI.split('@')[1] : 'not set',
    allowedOrigins: process.env.ALLOWED_ORIGINS
});

const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');
const helmet = require('helmet');

const app = express();
const port = process.env.PORT || 10000;

// Define allowed origins with wildcards for subdomains
const allowedOrigins = [
  'http://learning-hub.s3-website.eu-west-2.amazonaws.com',
  'https://learning-hub.s3-website.eu-west-2.amazonaws.com',
  'https://bug-training-game.onrender.com',
  'http://bug-training-game.onrender.com',
  'https://bug-training-game-api.onrender.com',
  'http://bug-training-game-api.onrender.com',
  'http://localhost:3000',
  'http://localhost:5000',
  'http://localhost:8080',
  'http://127.0.0.1:5000',
  'http://127.0.0.1:3000',
  'http://127.0.0.1:8080'
];

// Add origins from environment variable if present
if (process.env.ALLOWED_ORIGINS) {
  const envOrigins = process.env.ALLOWED_ORIGINS.split(',').map(origin => origin.trim());
  console.log('Adding origins from environment:', envOrigins);
  allowedOrigins.push(...envOrigins);
}

// CORS configuration must be first
const corsOptions = {
  origin: function(origin, callback) {
    console.log('CORS Origin Check:', { 
      origin, 
      allowedOrigins,
      hasAllowedOrigins: process.env.ALLOWED_ORIGINS,
      nodeEnv: process.env.NODE_ENV 
    });
    
    // Allow requests with no origin (like mobile apps or Postman)
    if (!origin) {
      console.log('Allowing request with no origin');
      return callback(null, true);
    }

    // Always allow the S3 website
    if (origin === 'http://learning-hub.s3-website.eu-west-2.amazonaws.com') {
      console.log('Allowing S3 website');
      return callback(null, true);
    }

    // In development, allow all localhost origins
    if (process.env.NODE_ENV !== 'production' && (origin.startsWith('http://localhost:') || origin.startsWith('http://127.0.0.1:'))) {
      console.log('Allowing localhost origin in development');
      return callback(null, true);
    }

    // Allow Render domains in production
    if (process.env.NODE_ENV === 'production' && origin.includes('.onrender.com')) {
      console.log('Allowing Render domain:', origin);
      return callback(null, true);
    }

    // Allow other known origins
    if (allowedOrigins.includes(origin)) {
      console.log('Allowing known origin:', origin);
      return callback(null, true);
    }

    // Log and reject unknown origins
    console.error('Origin not allowed:', origin);
    callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Accept', 'Origin', 'X-Requested-With'],
  exposedHeaders: ['Authorization'],
  maxAge: 86400 // 24 hours
};

// Apply CORS configuration before any other middleware
app.use(cors(corsOptions));

// Handle preflight requests explicitly
app.options('*', cors(corsOptions));

// Other middleware after CORS
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(helmet());

// Debug logging middleware after CORS
app.use((req, res, next) => {
  console.log('Request details:', {
    method: req.method,
    path: req.path,
    origin: req.get('origin'),
    corsHeaders: {
      allowOrigin: res.getHeader('Access-Control-Allow-Origin'),
      allowCredentials: res.getHeader('Access-Control-Allow-Credentials'),
      allowMethods: res.getHeader('Access-Control-Allow-Methods'),
      allowHeaders: res.getHeader('Access-Control-Allow-Headers')
    }
  });
  next();
});

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`, {
        headers: req.headers,
        body: req.body,
        query: req.query,
        origin: req.get('origin')
    });

    // Capture the original res.json to add logging
    const originalJson = res.json;
    res.json = function(data) {
        console.log('Response:', {
            path: req.path,
            statusCode: res.statusCode,
            data: data
        });
        return originalJson.call(this, data);
    };

    next();
});

// Health check endpoint for Render
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Service is healthy' });
});

// Connect to MongoDB with indexes and better error handling
const mongooseOptions = {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
    family: 4,
    maxPoolSize: 10,
    minPoolSize: 2,
    maxIdleTimeMS: 10000,
    retryWrites: true,
    retryReads: true
};

mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
    .then(async () => {
        try {
            // Create indexes
            await mongoose.connection.collection('users').createIndex({ username: 1 }, { unique: true });
            await mongoose.connection.collection('users').createIndex({ 'quizResults.quizName': 1 });
            await mongoose.connection.collection('users').createIndex({ 'quizProgress': 1 });
            
            // Initialize system settings
            await initializeSystemSettings();
            
            // Log successful connection and index creation
            console.log('Connected to MongoDB and created indexes');
            
            // Log connection details in development
            if (process.env.NODE_ENV !== 'production') {
                console.log('MongoDB Connection Details:', {
                    host: mongoose.connection.host,
                    port: mongoose.connection.port,
                    name: mongoose.connection.name
                });
            }
            
            // Start the reset task AFTER MongoDB is connected and ready
            console.log('MongoDB connected - starting background reset task...');
            startResetTask();
            
        } catch (error) {
            console.error('Error creating indexes or initializing settings:', error);
            // Continue even if index creation fails
        }
    })
    .catch(err => {
        console.error('MongoDB connection error:', err);
        // Exit process on connection failure in production
        if (process.env.NODE_ENV === 'production') {
            process.exit(1);
        }
    });

// Initialize system settings
async function initializeSystemSettings() {
    try {
        // Import Setting model
        const Setting = require('./models/setting.model');
        
        // Default settings
        const defaultSettings = [
            {
                key: 'quizTimerSeconds',
                value: 60,
                description: 'Time allowed for each quiz question in seconds (0-300, 0 = disabled)'
            }
            // Add other default settings here as needed
        ];
        
        // Initialize each setting (only if it doesn't exist)
        for (const setting of defaultSettings) {
            const exists = await Setting.findOne({ key: setting.key });
            if (!exists) {
                await Setting.create(setting);
                console.log(`Created default setting: ${setting.key} = ${setting.value}`);
            }
        }
        
        console.log('System settings initialized');
    } catch (error) {
        console.error('Error initializing system settings:', error);
    }
}

// Add MongoDB connection error handlers with reconnection logic
mongoose.connection.on('error', err => {
    console.error('MongoDB error:', err);
    if (process.env.NODE_ENV === 'production') {
        // In production, attempt to reconnect after a delay
        setTimeout(() => {
            mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
                .catch(err => console.error('Reconnection failed:', err));
        }, 5000);
    }
});

mongoose.connection.on('disconnected', () => {
    console.log('MongoDB disconnected. Attempting to reconnect...');
    if (process.env.NODE_ENV === 'production') {
        setTimeout(() => {
            mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
                .catch(err => console.error('Reconnection failed:', err));
        }, 5000);
    }
});

mongoose.connection.on('reconnected', () => {
    console.log('MongoDB reconnected');
});

// Add connection monitoring for production
if (process.env.NODE_ENV === 'production') {
    setInterval(() => {
        if (mongoose.connection.readyState !== 1) {
            console.log('MongoDB connection lost. Current state:', mongoose.connection.readyState);
            mongoose.connect(process.env.MONGODB_URI, mongooseOptions)
                .catch(err => console.error('Reconnection failed:', err));
        }
    }, 30000); // Check every 30 seconds
}

// Scheduled resets are now handled by frontend countdown system using existing auto-reset intervals
// This eliminates the need for separate background tasks

// Routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
    if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
        console.error('JSON Parse Error:', err);
        return res.status(400).json({ 
            success: false, 
            message: 'Invalid JSON payload' 
        });
    }
    next(err);
});

// Add specific error handler for token verification
app.use((err, req, res, next) => {
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({
            success: false,
            message: 'Invalid or expired token'
        });
    }
    next(err);
});

// General error handler
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({ 
        success: false, 
        message: 'Server error',
        error: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
        timestamp: new Date().toISOString()
    });
});

// Serve static files and handle SPA routing AFTER API routes
app.use(express.static(path.join(__dirname, '../frontend')));

app.get('*', (req, res) => {
    // Don't interfere with API routes
    if (!req.path.startsWith('/api')) {
        res.sendFile(path.join(__dirname, '../frontend/index.html'));
    }
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 