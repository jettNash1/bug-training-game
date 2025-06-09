const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        console.log('Auth middleware - headers:', req.headers);
        const authHeader = req.header('Authorization');
        console.log('Auth header:', authHeader);
        
        // Handle missing Authorization header
        if (!authHeader) {
            console.log('No Authorization header');
            return res.status(401).json({ 
                success: false, 
                message: 'No Authorization header provided' 
            });
        }
        
        const token = authHeader.replace('Bearer ', '');
        console.log('Extracted token:', token ? `${token.substring(0, 10)}...` : 'none');
        
        if (!token) {
            console.log('No token provided');
            return res.status(401).json({ 
                success: false, 
                message: 'No authentication token provided' 
            });
        }

        // Check if JWT_SECRET is configured
        if (!process.env.JWT_SECRET) {
            console.error('JWT_SECRET is not configured');
            return res.status(500).json({
                success: false,
                message: 'Server configuration error'
            });
        }

        console.log('Verifying token with secret:', process.env.JWT_SECRET ? 'present' : 'missing');
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('Token decoded successfully:', { userId: decoded.id, isAdmin: decoded.isAdmin });
        
        req.user = decoded;
        
        // Check for admin routes
        if (req.path.startsWith('/admin') && !decoded.isAdmin) {
            console.log('Admin access denied');
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        
        // Handle specific JWT errors
        if (error.name === 'TokenExpiredError') {
            return res.status(401).json({
                success: false,
                message: 'Token has expired',
                error: 'TOKEN_EXPIRED'
            });
        }
        
        if (error.name === 'JsonWebTokenError') {
            return res.status(401).json({
                success: false,
                message: 'Invalid token format',
                error: 'INVALID_TOKEN'
            });
        }
        
        res.status(401).json({ 
            success: false, 
            message: 'Invalid authentication token',
            error: process.env.NODE_ENV === 'production' ? undefined : error.message
        });
    }
}; 