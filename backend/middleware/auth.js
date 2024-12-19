const jwt = require('jsonwebtoken');

module.exports = (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ 
                success: false, 
                message: 'No authentication token provided' 
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded;
        
        // Check for admin routes
        if (req.path.startsWith('/admin') && !decoded.isAdmin) {
            return res.status(403).json({ 
                success: false, 
                message: 'Admin access required' 
            });
        }

        next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(401).json({ 
            success: false, 
            message: 'Invalid authentication token' 
        });
    }
}; 