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
/*
const port = process.env.PORT || 3000;

// Security middleware
app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"],
            scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
            styleSrc: ["'self'", "'unsafe-inline'"],
            imgSrc: ["'self'", "data:", "https:"],
            connectSrc: ["'self'", "https:", "wss:"],
            fontSrc: ["'self'", "https:", "data:"],
            objectSrc: ["'none'"],
            mediaSrc: ["'self'"],
            frameSrc: ["'none'"]
        }
    }
}));

// Parse JSON payloads
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const getAllowedOrigins = () => {
    const origins = [];
    
    // Add configured origins
    if (process.env.ALLOWED_ORIGINS) {
        origins.push(...process.env.ALLOWED_ORIGINS.split(','));
    }
    
    // Add default origins based on environment
    if (process.env.NODE_ENV === 'production') {
        origins.push(
            'https://bug-training-game.onrender.com',
            process.env.AWS_FRONTEND_URL || 'https://your-cloudfront-distribution.cloudfront.net'
        );
        
        // Add AWS domain patterns
        origins.push(/\.amazonaws\.com$/, /\.cloudfront\.net$/);
    } else {
        origins.push(
            'http://localhost:3000',
            'http://127.0.0.1:3000',
            'http://localhost:5500',
            'http://127.0.0.1:5500'
        );
    }
    
    return origins;
};*/

// Middleware
const corsOptions = {
  origin: (origin, callback) => {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    const allowedDomains = [
      // Production domain
      'http://learning-hub.s3-website.eu-west-2.amazonaws.com',
      // Development domains
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:5500',
      'http://127.0.0.1:5500'
    ];

    // Add configured origins from environment variable
    if (process.env.ALLOWED_ORIGINS) {
      allowedDomains.push(...process.env.ALLOWED_ORIGINS.split(','));
    }

    // Check if the origin is allowed
    if (allowedDomains.includes(origin)) {
      callback(null, true);
    } else {
      console.log('CORS blocked origin:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['Authorization']
};

app.use(cors(corsOptions));

// Add CORS preflight
app.options('*', cors(corsOptions));

// Additional security headers
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Credentials', 'true');
    res.header('Access-Control-Allow-Origin', 'http://learning-hub.s3-website.eu-west-2.amazonaws.com');
    res.header('X-Content-Type-Options', 'nosniff');
    res.header('X-Frame-Options', 'DENY');
    res.header('X-XSS-Protection', '1; mode=block');
    next();
});

// Parse JSON bodies (Remove once ready)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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

// Routes
const userRoutes = require('./routes/users');
app.use('/api/users', userRoutes);

const adminRoutes = require('./routes/admin');
app.use('/api/admin', adminRoutes);

// Add headers for development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'http://localhost:3000');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        next();
    });
}

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