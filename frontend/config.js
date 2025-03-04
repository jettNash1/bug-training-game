// Environment detection
const isProd = window.location.hostname.includes('render.com') || 
               window.location.hostname === 'bug-training-game.onrender.com' ||
               window.location.hostname.includes('amazonaws.com') ||
               window.location.hostname.includes('cloudfront.net');

// Get the API endpoint based on environment
const getApiEndpoint = () => {
    if (window.location.hostname.includes('render.com') || window.location.hostname === 'bug-training-game.onrender.com') {
        return `https://${window.location.hostname.replace('bug-training-game', 'bug-training-game-api')}`;
    }
    
    if (window.location.hostname.includes('amazonaws.com')) {
        // Direct S3 website hosting
        return 'http://13.42.151.152';
    }
    
    // Local development
    return 'http://localhost:3000';
};

// Configuration object
export const config = {
    apiUrl: `${getApiEndpoint()}/api`,
    wsUrl: `${getApiEndpoint().replace('http', 'ws')}/ws`,
    isProduction: isProd
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