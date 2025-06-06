// Environment detection
const isProd = window.location.hostname.includes('amazonaws.com') ||
               window.location.hostname.includes('s3-website') ||
               window.location.hostname.includes('learning-hub');

// Get the API endpoint based on environment
const getApiEndpoint = () => {
    if (isProd) {
        // Production environment - always use EC2 instance
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

// Log configuration in all environments to help with debugging
console.log('App configuration:', {
    environment: isProd ? 'production' : 'development',
    hostname: window.location.hostname,
    apiUrl: config.apiUrl,
    wsUrl: config.wsUrl
}); 