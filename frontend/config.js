// Environment detection
const isProd = window.location.hostname.includes('amazonaws.com') ||
               window.location.hostname.includes('s3-website') ||
               window.location.hostname.includes('learning-hub');

// Get the API endpoint based on environment
const getApiEndpoint = () => {
    if (isProd) {
        // Production - AWS API
        return 'http://api.learning-hub.eu-west-2.amazonaws.com';
    } else if (window.location.hostname.includes('render.com')) {
        // Development - Render
        return 'https://bug-training-game-api.onrender.com';
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