const Game = require('../models/Game');
const GameSession = require('../models/GameSession');
const { Rating, Comment } = require('../models/Rating');
const Achievement = require('../models/Achievement');

/**
 * @swagger
 * /games:
 *   get:
 *     summary: Get all games
 *     tags: [Games]
 *     responses:
 *       200:
 *         description: List of all available games with stats
 */
exports.getAll = async (req, res) => {
    try {
        const games = await Game.getAllWithStats();

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
 * @swagger
 * /games/{id}:
 *   get:
 *     summary: Get game details
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Game details with comments and ratings
 *       404:
 *         description: Game not found
 */
exports.getById = async (req, res) => {
    try {
        const { id } = req.params;

        const game = await Game.getWithStats(parseInt(id));
        if (!game) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Game not found' }
            });
        }

        // Get comments
        const comments = await Comment.getByGame(parseInt(id), { page: 1, limit: 10 });

        // Get user's rating if logged in
        let userRating = null;
        if (req.user) {
            userRating = await Rating.getUserRating(req.user.id, parseInt(id));
        }

        res.json({
            success: true,
            data: {
                ...game,
                comments: comments.data,
                user_rating: userRating?.stars || null
            }
        });
    } catch (error) {
        console.error('Get game error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /games/{id}/sessions:
 *   post:
 *     summary: Create game session (start/save game)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               config:
 *                 type: object
 *               state:
 *                 type: object
 *               score:
 *                 type: integer
 *               time_spent:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Game session created
 *       404:
 *         description: Game not found
 */
exports.createSession = async (req, res) => {
    try {
        const { id } = req.params;
        const { config, state, score, time_spent } = req.body;

        const game = await Game.findById(parseInt(id));
        if (!game) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Game not found' }
            });
        }

        if (!game.enabled) {
            return res.status(400).json({
                success: false,
                error: { code: 'GAME_DISABLED', message: 'This game is currently disabled' }
            });
        }

        // Use provided state (saving) or initialize new state (starting new game)
        let gameState;
        if (state) {
            // Saving existing game - use provided state
            gameState = state;
        } else {
            // Starting new game - initialize state
            const gameConfig = { ...game.config, ...config };
            gameState = initializeGameState(game.type, gameConfig);
        }

        const session = await GameSession.create({
            user_id: req.user.id,
            game_id: parseInt(id),
            state: gameState,
            score: score || 0,
            time_spent: time_spent || 0
        });

        res.status(201).json({
            success: true,
            data: {
                sessionId: session.id,
                gameId: game.id,
                state: session.state,
                score: session.score,
                time_spent: session.time_spent
            },
            message: 'Game session created'
        });
    } catch (error) {
        console.error('Create session error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /games/sessions/{sessionId}:
 *   put:
 *     summary: Update game session (save game)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               state:
 *                 type: object
 *               score:
 *                 type: integer
 *               time_spent:
 *                 type: integer
 *               completed:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Game saved
 *       403:
 *         description: Not your session
 */
exports.updateSession = async (req, res) => {
    try {
        const { sessionId } = req.params;
        const { state, score, time_spent, completed } = req.body;

        const session = await GameSession.findById(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Session not found' }
            });
        }

        if (session.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Not your game session' }
            });
        }

        const updated = await GameSession.update(sessionId, {
            state,
            score,
            time_spent,
            completed
        });

        // Check achievements if game completed
        if (completed) {
            await Achievement.checkAndUnlock(req.user.id);
        }

        res.json({
            success: true,
            data: {
                sessionId: updated.id,
                state: updated.state,
                score: updated.score,
                time_spent: updated.time_spent,
                completed: updated.completed
            },
            message: 'Game saved successfully'
        });
    } catch (error) {
        console.error('Update session error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /games/sessions/{sessionId}:
 *   get:
 *     summary: Get game session (load game)
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Session data
 *       404:
 *         description: Session not found
 */
exports.getSession = async (req, res) => {
    try {
        const { sessionId } = req.params;

        const session = await GameSession.findWithGame(sessionId);
        if (!session) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Session not found' }
            });
        }

        if (session.user_id !== req.user.id) {
            return res.status(403).json({
                success: false,
                error: { code: 'FORBIDDEN', message: 'Not your game session' }
            });
        }

        res.json({
            success: true,
            data: {
                sessionId: session.id,
                gameId: session.game_id,
                game: {
                    name: session.game_name,
                    type: session.game_type
                },
                state: session.state,
                score: session.score,
                time_spent: session.time_spent,
                completed: session.completed,
                created_at: session.created_at
            }
        });
    } catch (error) {
        console.error('Get session error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /games/sessions:
 *   get:
 *     summary: Get user's saved games
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *       - in: query
 *         name: completed
 *         schema:
 *           type: boolean
 *     responses:
 *       200:
 *         description: List of saved games
 */
exports.getSavedGames = async (req, res) => {
    try {
        const { page = 1, limit = 10, completed } = req.query;

        const result = await GameSession.getUserSavedGames(req.user.id, {
            page: parseInt(page),
            limit: parseInt(limit),
            completed: completed === 'true' ? true : completed === 'false' ? false : undefined
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get saved games error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /games/{id}/ratings:
 *   post:
 *     summary: Rate a game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               stars:
 *                 type: integer
 *                 minimum: 1
 *                 maximum: 5
 *     responses:
 *       201:
 *         description: Rating submitted
 */
exports.rateGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { stars } = req.body;

        if (!stars || stars < 1 || stars > 5) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Stars must be between 1 and 5' }
            });
        }

        const rating = await Rating.rate(req.user.id, parseInt(id), stars);

        res.status(201).json({
            success: true,
            data: rating,
            message: 'Rating submitted'
        });
    } catch (error) {
        console.error('Rate game error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /games/{id}/ratings:
 *   get:
 *     summary: Get game ratings
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Rating stats and user rating
 */
exports.getRatings = async (req, res) => {
    try {
        const { id } = req.params;

        // Get average rating and total count
        const stats = await Rating.getGameStats(parseInt(id));

        // Get user's rating if logged in
        let userRating = null;
        if (req.user) {
            const rating = await Rating.getUserRating(req.user.id, parseInt(id));
            userRating = rating?.stars || null;
        }

        res.json({
            success: true,
            data: {
                average: parseFloat(stats?.avg_rating) || 0,
                total: stats?.total_ratings || 0,
                userRating
            }
        });
    } catch (error) {
        console.error('Get ratings error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};


/**
 * @swagger
 * /games/{id}/comments:
 *   post:
 *     summary: Comment on a game
 *     tags: [Games]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Comment created
 */
exports.commentGame = async (req, res) => {
    try {
        const { id } = req.params;
        const { content } = req.body;

        if (!content || content.trim().length === 0) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Content is required' }
            });
        }

        const comment = await Comment.create(req.user.id, parseInt(id), content.trim());

        res.status(201).json({
            success: true,
            data: {
                id: comment.id,
                content: comment.content,
                user: {
                    id: req.user.id,
                    username: req.user.username
                },
                created_at: comment.created_at
            },
            message: 'Comment posted'
        });
    } catch (error) {
        console.error('Comment game error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /games/{id}/comments:
 *   get:
 *     summary: Get game comments
 *     tags: [Games]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: List of comments
 */
exports.getComments = async (req, res) => {
    try {
        const { id } = req.params;
        const { page = 1, limit = 10 } = req.query;

        const result = await Comment.getByGame(parseInt(id), {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get comments error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * Initialize game state based on type
 */
function initializeGameState(type, config) {
    const boardSize = config.boardSize || { rows: 10, cols: 10 };

    switch (type) {
        case 'caro':
        case 'tictactoe':
            // Create empty board
            const board = Array(boardSize.rows).fill(null)
                .map(() => Array(boardSize.cols).fill(0));
            return {
                board,
                currentPlayer: 1,
                moves: [],
                winner: null
            };

        case 'snake':
            return {
                snake: [{ x: Math.floor(boardSize.cols / 2), y: Math.floor(boardSize.rows / 2) }],
                food: { x: Math.floor(Math.random() * boardSize.cols), y: Math.floor(Math.random() * boardSize.rows) },
                direction: 'right',
                gameOver: false
            };

        case 'match3':
            // Create board with random colors
            const colors = config.colors || 6;
            const match3Board = Array(boardSize.rows).fill(null)
                .map(() => Array(boardSize.cols).fill(0)
                    .map(() => Math.floor(Math.random() * colors) + 1));
            return {
                board: match3Board,
                selectedCell: null,
                moves: config.moves || 30
            };

        case 'memory':
            // Create pairs of cards
            const pairs = (boardSize.rows * boardSize.cols) / 2;
            const cards = [];
            for (let i = 1; i <= pairs; i++) {
                cards.push(i, i);
            }
            // Shuffle
            for (let i = cards.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [cards[i], cards[j]] = [cards[j], cards[i]];
            }
            return {
                cards,
                revealed: Array(cards.length).fill(false),
                matched: Array(cards.length).fill(false),
                firstCard: null,
                moves: 0
            };

        case 'drawing':
            return {
                strokes: [],
                currentColor: '#000000',
                brushSize: 5
            };

        default:
            return {};
    }
}
