const User = require('../models/User');
const Achievement = require('../models/Achievement');

/**
 * Search users
 */
exports.search = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const result = await User.search({
            search,
            page: parseInt(page),
            limit: parseInt(limit),
            excludeUserId: req.user.id
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Search users error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Get user profile
 */
exports.getProfile = async (req, res) => {
    try {
        const { id } = req.params;

        const user = await User.findById(id);
        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'User not found' }
            });
        }

        const stats = await User.getStats(id);

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                avatar_url: user.avatar_url,
                created_at: user.created_at,
                stats
            }
        });
    } catch (error) {
        console.error('Get profile error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Update own profile
 */
exports.updateProfile = async (req, res) => {
    try {
        const { id } = req.params;

        // Can only update own profile
        if (id !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Cannot update other users profile' }
            });
        }

        const { username, avatar_url } = req.body;
        const updateData = {};

        if (username) {
            // Check if username is taken
            const existing = await User.findByUsername(username);
            if (existing && existing.id !== id) {
                return res.status(409).json({
                    success: false,
                    error: { code: 'USERNAME_EXISTS', message: 'Username already taken' }
                });
            }
            updateData.username = username;
        }

        if (avatar_url !== undefined) {
            updateData.avatar_url = avatar_url;
        }

        const user = await User.update(id, updateData);

        res.json({
            success: true,
            data: {
                id: user.id,
                username: user.username,
                avatar_url: user.avatar_url
            },
            message: 'Profile updated successfully'
        });
    } catch (error) {
        console.error('Update profile error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Get user achievements
 */
exports.getAchievements = async (req, res) => {
    try {
        const { id } = req.params;

        const achievements = await Achievement.getUserAchievements(id);

        res.json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('Get achievements error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Get current user's achievements
 */
exports.getMyAchievements = async (req, res) => {
    try {
        const achievements = await Achievement.getUserAchievements(req.user.id);

        res.json({
            success: true,
            data: achievements
        });
    } catch (error) {
        console.error('Get my achievements error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};
