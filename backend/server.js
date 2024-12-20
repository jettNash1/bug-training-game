// Update any relative path references
require('dotenv').config({ path: '../.env' });
require('dotenv').config({ path: '.env' });

// Add this after dotenv config to debug environment variables
console.log('Environment check:', {
    nodeEnv: process.env.NODE_ENV,
    hasAdminUser: !!process.env.ADMIN_USERNAME,
    hasAdminPass: !!process.env.ADMIN_PASSWORD,
    hasJwtSecret: !!process.env.JWT_SECRET,
    hasJwtRefreshSecret: !!process.env.JWT_REFRESH_SECRET
});

// Rest of your server code remains the same
const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Middleware
const corsOptions = {
  origin: process.env.NODE_ENV === 'production'
    ? ['https://bug-training-game.onrender.com']
    : ['http://localhost:8080', 'http://127.0.0.1:8080'],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
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
            console.error('Error creating indexes:', error);
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

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, '../build')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

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

// Add this after your other error middleware
app.use((err, req, res, next) => {
    console.error('Server Error:', err);
    res.status(err.status || 500).json({ 
        success: false, 
        message: 'Server error',
        error: process.env.NODE_ENV === 'production' ? null : err.message
    });
});

// Add headers for development
if (process.env.NODE_ENV !== 'production') {
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', 'http://localhost:8080');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        next();
    });
}

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

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 