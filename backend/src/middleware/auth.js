const jwt = require('jsonwebtoken');
const db = require('../config/database');

/**
 * Authentication middleware
 * Verifies JWT token and attaches user to request
 */
const auth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'UNAUTHORIZED',
                    message: 'No token provided'
                }
            });
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from database
            const user = await db('users')
                .where({ id: decoded.userId })
                .first();

            if (!user) {
                return res.status(401).json({
                    success: false,
                    error: {
                        code: 'UNAUTHORIZED',
                        message: 'User not found'
                    }
                });
            }

            // Attach user to request (excluding password)
            req.user = {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar_url: user.avatar_url,
                is_admin: user.is_admin
            };

            next();
        } catch (err) {
            return res.status(401).json({
                success: false,
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid or expired token'
                }
            });
        }
    } catch (error) {
        console.error('Auth middleware error:', error);
        res.status(500).json({
            success: false,
            error: {
                code: 'SERVER_ERROR',
                message: 'Internal server error'
            }
        });
    }
};

/**
 * Optional auth - doesn't fail if no token
 */
const optionalAuth = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith('Bearer ')) {
            return next();
        }

        const token = authHeader.split(' ')[1];

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const user = await db('users').where({ id: decoded.userId }).first();

            if (user) {
                req.user = {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    avatar_url: user.avatar_url,
                    is_admin: user.is_admin
                };
            }
        } catch (err) {
            // Token invalid but continue without user
        }

        next();
    } catch (error) {
        next();
    }
};

module.exports = { auth, optionalAuth };
