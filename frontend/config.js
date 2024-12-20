// Environment detection
const isProd = window.location.hostname === 'bug-training-game.onrender.com';

// Configuration object
export const config = {
    apiUrl: isProd 
        ? 'https://bug-training-game-api.onrender.com/api'
        : 'http://localhost:10000/api'
};

// Log configuration
console.log('App configuration:', {
    environment: isProd ? 'production' : 'development',
    hostname: window.location.hostname,
    apiUrl: config.apiUrl
}); 