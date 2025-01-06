// Environment detection
const isProd = window.location.hostname.includes('render.com') || 
               window.location.hostname === 'bug-training-game.onrender.com';

// Configuration object
export const config = {
    apiUrl: isProd 
        ? `https://${window.location.hostname.replace('bug-training-game', 'bug-training-game-api')}/api`
        : 'http://localhost:10000/api',
    wsUrl: isProd
        ? `wss://${window.location.hostname.replace('bug-training-game', 'bug-training-game-api')}/ws`
        : 'ws://localhost:10000/ws'
};

// Log configuration in non-production environments
if (!isProd) {
    console.log('App configuration:', {
        environment: isProd ? 'production' : 'development',
        hostname: window.location.hostname,
        apiUrl: config.apiUrl,
        wsUrl: config.wsUrl
    });
} 