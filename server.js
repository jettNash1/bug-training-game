// Update any relative path references
require('dotenv').config({ path: '../.env' });

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
    ? ['https://bug-training-game.onrender.com', 'http://localhost:3000']
    : ['http://localhost:3000'],
  credentials: true,
  optionsSuccessStatus: 200
};

app.use(cors(corsOptions));
app.use(express.json());

// Debug middleware to log requests
app.use((req, res, next) => {
    console.log(`${req.method} ${req.path}`);
    next();
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Routes
const userRoutes = require('./quiz-backend/routes/users');
app.use('/api/users', userRoutes);

// Serve static files from the build directory
app.use(express.static(path.join(__dirname, '../build')));

// Handle SPA routing
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../build/index.html'));
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error:', err);
    res.status(500).json({ 
        success: false, 
        message: 'Something went wrong!',
        error: err.message 
    });
});

// Start server
app.listen(port, () => {
    console.log(`Server running on port ${port}`);
}); 