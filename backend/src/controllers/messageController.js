const Message = require('../models/Message');

/**
 * @swagger
 * /messages/conversations:
 *   get:
 *     summary: Get conversations list
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
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
 *         description: List of conversations
 */
exports.getConversations = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await Message.getConversations(req.user.id, {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get conversations error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /messages/{userId}:
 *   get:
 *     summary: Get messages with user
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of messages
 */
exports.getMessages = async (req, res) => {
    try {
        const { userId } = req.params;
        const { page = 1, limit = 20 } = req.query;

        const result = await Message.getWithUser(req.user.id, userId, {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        // Mark messages as read
        await Message.markAllAsRead(req.user.id, userId);

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get messages error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /messages:
 *   post:
 *     summary: Send message
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - receiver_id
 *               - content
 *             properties:
 *               receiver_id:
 *                 type: string
 *               content:
 *                 type: string
 *     responses:
 *       201:
 *         description: Message sent
 *       400:
 *         description: Validation error
 */
exports.sendMessage = async (req, res) => {
    try {
        const { receiver_id, content } = req.body;

        if (!receiver_id || !content) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'receiver_id and content are required' }
            });
        }

        if (receiver_id === req.user.id) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Cannot send message to yourself' }
            });
        }

        const message = await Message.send(req.user.id, receiver_id, content.trim());

        res.status(201).json({
            success: true,
            data: {
                id: message.id,
                content: message.content,
                receiver_id: message.receiver_id,
                created_at: message.created_at
            },
            message: 'Message sent'
        });
    } catch (error) {
        console.error('Send message error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /messages/{messageId}/read:
 *   put:
 *     summary: Mark message as read
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: messageId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Message marked as read
 */
exports.markAsRead = async (req, res) => {
    try {
        const { messageId } = req.params;

        await Message.markAsRead(messageId, req.user.id);

        res.json({
            success: true,
            message: 'Message marked as read'
        });
    } catch (error) {
        console.error('Mark as read error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /messages/unread:
 *   get:
 *     summary: Get unread message count
 *     tags: [Messages]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Unread count
 */
exports.getUnreadCount = async (req, res) => {
    try {
        const count = await Message.getUnreadCount(req.user.id);

        res.json({
            success: true,
            data: { unread_count: count }
        });
    } catch (error) {
        console.error('Get unread count error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};
