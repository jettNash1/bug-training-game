// Environment detection
const isProd = window.location.hostname !== 'localhost' && 
               window.location.hostname !== '127.0.0.1' &&
               !window.location.hostname.includes('.preview.');

// Configuration object
export const config = {
    apiUrl: isProd 
        ? 'https://bug-training-game.onrender.com/api'
        : 'http://localhost:10000/api',
    isDev: !isProd
};

// Log configuration in development
if (!isProd) {
    console.log('Running in development mode:', {
        hostname: window.location.hostname,
        apiUrl: config.apiUrl
    });
} 