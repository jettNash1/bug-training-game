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
    
    if (window.location.hostname.includes('cloudfront.net')) {
        // When using CloudFront, we need to use the EC2 instance's public DNS/IP
        return process.env.AWS_API_ENDPOINT || 'http://your-ec2-public-dns';
    }
    
    if (window.location.hostname.includes('amazonaws.com')) {
        // Direct S3 website hosting
        return process.env.AWS_API_ENDPOINT || 'http://your-ec2-public-dns';
    }
    
    // Local development
    return 'http://localhost:3000';
};

// Configuration object
export const config = {
    apiUrl: isProd 
        ? (window.location.hostname.includes('render.com') || window.location.hostname === 'bug-training-game.onrender.com')
            ? `https://${window.location.hostname.replace('bug-training-game', 'bug-training-game-api')}/api`
            : `https://${window.location.hostname.includes('cloudfront') ? process.env.AWS_API_ENDPOINT || 'your-ec2-instance-dns.amazonaws.com' : window.location.hostname}/api`
        : 'http://localhost:10000/api',
    wsUrl: isProd
        ? (window.location.hostname.includes('render.com') || window.location.hostname === 'bug-training-game.onrender.com')
            ? `wss://${window.location.hostname.replace('bug-training-game', 'bug-training-game-api')}/ws`
            : `wss://${window.location.hostname.includes('cloudfront') ? process.env.AWS_API_ENDPOINT || 'your-ec2-instance-dns.amazonaws.com' : window.location.hostname}/ws`
        : 'ws://localhost:10000/ws'
        /* replace the above with this once set up
            apiUrl: `${getApiEndpoint()}/api`,
    wsUrl: `${getApiEndpoint().replace('http', 'ws')}/ws`,
    isProduction: isProd
        
        */
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