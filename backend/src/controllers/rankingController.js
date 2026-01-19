const GameSession = require('../models/GameSession');
const Friend = require('../models/Friend');

/**
 * Get global rankings for a game
 */
exports.getGlobalRanking = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const result = await GameSession.getRankings(parseInt(gameId), {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get global ranking error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Get friends ranking for a game
 */
exports.getFriendsRanking = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        // Get friend IDs
        const friendIds = await Friend.getFriendIds(req.user.id);
        friendIds.push(req.user.id); // Include self

        const result = await GameSession.getRankings(parseInt(gameId), {
            page: parseInt(page),
            limit: parseInt(limit),
            userIds: friendIds
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get friends ranking error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Get personal ranking history
 */
exports.getPersonalRanking = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const result = await GameSession.getPersonalHistory(
            req.user.id,
            parseInt(gameId),
            { page: parseInt(page), limit: parseInt(limit) }
        );

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get personal ranking error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};
