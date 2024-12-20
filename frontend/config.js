// Detect if we're in production based on the URL
const isProduction = window.location.hostname !== 'localhost' && window.location.hostname !== '127.0.0.1';

const config = {
    apiUrl: isProduction
        ? 'https://bug-training-game.onrender.com'
        : 'http://localhost:10000',
    environment: isProduction ? 'production' : 'development'
};

export default config; 