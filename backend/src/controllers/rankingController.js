const GameSession = require('../models/GameSession');
const Friend = require('../models/Friend');

/**
 * @swagger
 * /rankings:
 *   get:
 *     summary: Get global rankings
 *     tags: [Rankings]
 *     parameters:
 *       - in: query
 *         name: game_id
 *         schema:
 *           type: integer
 *         description: Filter by game ID
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
 *         description: Global rankings list
 */
exports.getGlobalRanking = async (req, res) => {
    try {
        const { gameId } = req.params;
        const { page = 1, limit = 10, game_id } = req.query;

        // gameId from params or query
        const targetGameId = gameId || game_id;

        const result = await GameSession.getRankings(targetGameId ? parseInt(targetGameId) : null, {
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
 * @swagger
 * /rankings/{gameId}/friends:
 *   get:
 *     summary: Get friends ranking for a game
 *     tags: [Rankings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Friends rankings
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
 * @swagger
 * /rankings/{gameId}/personal:
 *   get:
 *     summary: Get personal ranking history
 *     tags: [Rankings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: gameId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Personal ranking history
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
