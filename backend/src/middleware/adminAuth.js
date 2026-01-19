/**
 * Admin authorization middleware
 * Must be used after auth middleware
 */
const adminAuth = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Authentication required'
            }
        });
    }

    if (!req.user.is_admin) {
        return res.status(403).json({
            success: false,
            error: {
                code: 'FORBIDDEN',
                message: 'Admin access required'
            }
        });
    }

    next();
};

module.exports = adminAuth;
