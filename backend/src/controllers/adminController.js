const db = require('../config/database');
const User = require('../models/User');
const Game = require('../models/Game');

/**
 * @swagger
 * /admin/statistics:
 *   get:
 *     summary: Get dashboard statistics
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats (users, games, ratings, messages, activities)
 *       403:
 *         description: Admin access required
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

        // Messages count
        const [messagesCount] = await db('messages').count('* as count');

        // Recent activities - combine from multiple sources
        const recentGameSessions = await db('game_sessions')
            .select(
                'game_sessions.created_at',
                'users.username',
                'games.name as game_name'
            )
            .join('users', 'users.id', 'game_sessions.user_id')
            .join('games', 'games.id', 'game_sessions.game_id')
            .orderBy('game_sessions.created_at', 'desc')
            .limit(3);

        const recentUsers = await db('users')
            .select('username', 'created_at')
            .orderBy('created_at', 'desc')
            .limit(2);

        const recentRatings = await db('ratings')
            .select('ratings.stars', 'ratings.created_at', 'users.username', 'games.name as game_name')
            .join('users', 'users.id', 'ratings.user_id')
            .join('games', 'games.id', 'ratings.game_id')
            .orderBy('ratings.created_at', 'desc')
            .limit(2);

        // Format activities
        const activities = [
            ...recentGameSessions.map(s => ({
                type: 'game',
                icon: '🎮',
                text: `${s.username} đã chơi ${s.game_name}`,
                time: s.created_at
            })),
            ...recentUsers.map(u => ({
                type: 'register',
                icon: '👤',
                text: `${u.username} đã đăng ký`,
                time: u.created_at
            })),
            ...recentRatings.map(r => ({
                type: 'rating',
                icon: '⭐',
                text: `${r.username} đánh giá ${r.stars}* cho ${r.game_name}`,
                time: r.created_at
            }))
        ].sort((a, b) => new Date(b.time) - new Date(a.time)).slice(0, 5);

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
                },
                messages: {
                    total: parseInt(messagesCount.count)
                },
                activities
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
 * @swagger
 * /admin/users:
 *   get:
 *     summary: Get all users (admin)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *     responses:
 *       200:
 *         description: List of all users
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
