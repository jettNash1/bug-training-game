// Environment detection
const isProd = window.location.hostname.includes('render.com') || 
               window.location.hostname === 'bug-training-game.onrender.com' ||
               window.location.hostname.includes('amazonaws.com') ||
               window.location.hostname.includes('cloudfront.net') ||
               window.location.hostname.includes('s3-website') ||
               window.location.hostname.includes('learning-hub');

// Get the API endpoint based on environment
const getApiEndpoint = () => {
    if (window.location.hostname.includes('render.com') || window.location.hostname === 'bug-training-game.onrender.com') {
        return `https://${window.location.hostname.replace('bug-training-game', 'bug-training-game-api')}`;
    }
    
    if (window.location.hostname.includes('amazonaws.com') || 
        window.location.hostname.includes('s3-website') ||
        window.location.hostname.includes('learning-hub')) {
        // Use the current origin for AWS hosted site
        return window.location.origin;
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

// Log configuration in all environments to help with debugging
console.log('App configuration:', {
    environment: isProd ? 'production' : 'development',
    hostname: window.location.hostname,
    apiUrl: config.apiUrl,
    wsUrl: config.wsUrl
}); 