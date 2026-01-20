const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register new user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - username
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Registration successful
 */
exports.register = async (req, res) => {
    try {
        const { email, username, password } = req.body;

        // Check if email exists
        const existingEmail = await User.findByEmail(email);
        if (existingEmail) {
            return res.status(409).json({
                success: false,
                error: { code: 'EMAIL_EXISTS', message: 'Email already registered' }
            });
        }

        // Check if username exists
        const existingUsername = await User.findByUsername(username);
        if (existingUsername) {
            return res.status(409).json({
                success: false,
                error: { code: 'USERNAME_EXISTS', message: 'Username already taken' }
            });
        }

        // Hash password
        const password_hash = await bcrypt.hash(password, 12);

        // Create user
        const user = await User.create({
            email,
            username,
            password_hash,
            is_admin: false
        });

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.status(201).json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    is_admin: user.is_admin
                },
                token
            },
            message: 'Registration successful'
        });
    } catch (error) {
        console.error('Register error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login user
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - email
 *               - password
 *             properties:
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 */
exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user
        const user = await User.findByEmail(email);
        if (!user) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
            });
        }

        // Verify password
        const isMatch = await bcrypt.compare(password, user.password_hash);
        if (!isMatch) {
            return res.status(401).json({
                success: false,
                error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password' }
            });
        }

        // Check if user is banned
        if (user.status === 'banned') {
            return res.status(403).json({
                success: false,
                error: { code: 'USER_BANNED', message: 'Tài khoản đã bị khóa' }
            });
        }

        // Generate token
        const token = jwt.sign(
            { userId: user.id },
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRES_IN }
        );

        res.json({
            success: true,
            data: {
                user: {
                    id: user.id,
                    email: user.email,
                    username: user.username,
                    avatar_url: user.avatar_url,
                    is_admin: user.is_admin
                },
                token
            },
            message: 'Login successful'
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /auth/me:
 *   get:
 *     summary: Get current user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Current user data
 */
exports.me = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                avatar_url: user.avatar_url,
                is_admin: user.is_admin,
                created_at: user.created_at
            }
        });
    } catch (error) {
        console.error('Get me error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /auth/logout:
 *   post:
 *     summary: Logout user
 *     tags: [Auth]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Logout successful
 */
exports.logout = async (req, res) => {
    // JWT is stateless, client should remove token
    res.json({
        success: true,
        message: 'Logout successful'
    });
};
