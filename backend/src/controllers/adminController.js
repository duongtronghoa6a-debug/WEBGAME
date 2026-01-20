const db = require('../config/database');
const User = require('../models/User');
const Game = require('../models/Game');

/**
 * Get dashboard statistics
 */
exports.getStatistics = async (req, res) => {
    try {
        // Users stats
        const [usersTotal] = await db('users').count('* as count');
        const [usersToday] = await db('users')
            .where('created_at', '>=', db.raw("NOW() - INTERVAL '1 day'"))
            .count('* as count');
        const [usersWeek] = await db('users')
            .where('created_at', '>=', db.raw("NOW() - INTERVAL '7 days'"))
            .count('* as count');

        // Games stats
        const [playsTotal] = await db('game_sessions').count('* as count');
        const [playsToday] = await db('game_sessions')
            .where('created_at', '>=', db.raw("NOW() - INTERVAL '1 day'"))
            .count('* as count');

        // Most popular games
        const popularGames = await db('game_sessions')
            .select('game_id')
            .count('* as plays')
            .groupBy('game_id')
            .orderBy('plays', 'desc')
            .limit(5);

        // Get game names
        const gamesWithNames = await Promise.all(
            popularGames.map(async (g) => {
                const game = await Game.findById(g.game_id);
                return {
                    id: g.game_id,
                    name: game?.name || 'Unknown',
                    plays: parseInt(g.plays)
                };
            })
        );

        // Ratings stats
        const [ratingStats] = await db('ratings')
            .select(
                db.raw('COALESCE(AVG(stars), 0) as average'),
                db.raw('COUNT(*) as total')
            );

        res.json({
            success: true,
            data: {
                users: {
                    total: parseInt(usersTotal.count),
                    new_today: parseInt(usersToday.count),
                    new_this_week: parseInt(usersWeek.count)
                },
                games: {
                    total_plays: parseInt(playsTotal.count),
                    plays_today: parseInt(playsToday.count),
                    most_popular: gamesWithNames
                },
                ratings: {
                    average: parseFloat(ratingStats.average).toFixed(1),
                    total: parseInt(ratingStats.total)
                }
            }
        });
    } catch (error) {
        console.error('Get statistics error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Get all users (admin)
 */
exports.getUsers = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;

        const result = await User.getAll({
            search,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get users error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Update user (admin)
 */
exports.updateUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { is_admin, status, role } = req.body;

        // Build update data
        const updateData = {};
        if (is_admin !== undefined) updateData.is_admin = is_admin;
        if (status !== undefined) updateData.status = status;
        if (role !== undefined) updateData.role = role;

        // Prevent empty update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'No valid update fields provided' }
            });
        }

        const user = await User.update(id, updateData);

        if (!user) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'User not found' }
            });
        }

        res.json({
            success: true,
            data: {
                id: user.id,
                email: user.email,
                username: user.username,
                is_admin: user.is_admin,
                status: user.status,
                role: user.role
            },
            message: 'User updated successfully'
        });
    } catch (error) {
        console.error('Update user error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Delete user (admin)
 */
exports.deleteUser = async (req, res) => {
    try {
        const { id } = req.params;

        // Prevent deleting self
        if (id === req.user.id) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Cannot delete yourself' }
            });
        }

        await User.delete(id);

        res.json({
            success: true,
            message: 'User deleted successfully'
        });
    } catch (error) {
        console.error('Delete user error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Get all games (admin) - including disabled
 */
exports.getGames = async (req, res) => {
    try {
        const games = await Game.getAllWithStats(true);

        res.json({
            success: true,
            data: games
        });
    } catch (error) {
        console.error('Get games error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Update game config (admin)
 */
exports.updateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { enabled, is_active, config } = req.body;

        const updateData = {};
        // Accept both 'enabled' and 'is_active' (frontend sends is_active)
        if (enabled !== undefined) updateData.enabled = enabled;
        else if (is_active !== undefined) updateData.enabled = is_active;
        if (config) updateData.config = config;

        // Prevent empty update
        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'No valid update fields provided' }
            });
        }

        const game = await Game.update(parseInt(id), updateData);

        if (!game) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Game not found' }
            });
        }

        res.json({
            success: true,
            data: game,
            message: 'Game updated successfully'
        });
    } catch (error) {
        console.error('Update game error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};
