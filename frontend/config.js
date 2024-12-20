// Environment detection
const isProd = window.location.hostname === 'bug-training-game.onrender.com';

// Configuration object
export const config = {
    apiUrl: isProd 
        ? 'https://bug-training-game.onrender.com/api'
        : 'http://localhost:3000/api'
}; 