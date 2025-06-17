#!/usr/bin/env node

// Load environment variables
require('dotenv').config();

console.log('🚀 Starting Interview Account Migration Script');
console.log('='.repeat(50));

// Run the migration
require('./backend/migrate-interview-to-regular.js'); 