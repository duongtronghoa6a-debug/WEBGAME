const Friend = require('../models/Friend');
const db = require('../config/database');

/**
 * @swagger
 * /friends:
 *   get:
 *     summary: Get friends list
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [accepted, pending]
 *           default: accepted
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
 *         description: List of friends with pagination
 */
exports.getFriends = async (req, res) => {
    try {
        const { status = 'accepted', page = 1, limit = 10 } = req.query;

        const result = await Friend.getFriends(req.user.id, {
            status,
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get friends error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /friends/pending:
 *   get:
 *     summary: Get pending friend requests
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: List of pending requests
 */
exports.getPendingRequests = async (req, res) => {
    try {
        const { page = 1, limit = 10 } = req.query;

        const result = await Friend.getPendingRequests(req.user.id, {
            page: parseInt(page),
            limit: parseInt(limit)
        });

        res.json({
            success: true,
            ...result
        });
    } catch (error) {
        console.error('Get pending requests error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /friends/request:
 *   post:
 *     summary: Send friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - friend_id
 *             properties:
 *               friend_id:
 *                 type: string
 *     responses:
 *       201:
 *         description: Friend request sent
 *       400:
 *         description: Already friends or request exists
 */
exports.sendRequest = async (req, res) => {
    try {
        const { friend_id } = req.body;

        if (!friend_id) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'friend_id is required' }
            });
        }

        if (friend_id === req.user.id) {
            return res.status(400).json({
                success: false,
                error: { code: 'VALIDATION_ERROR', message: 'Cannot send friend request to yourself' }
            });
        }

        // Check if target user is an admin - don't allow friend requests to admins
        const targetUser = await db('users').where({ id: friend_id }).first();
        if (targetUser && (targetUser.role === 'admin' || targetUser.is_admin)) {
            return res.status(400).json({
                success: false,
                error: { code: 'ADMIN_NOT_ALLOWED', message: 'Cannot send friend request to admin users' }
            });
        }

        const result = await Friend.sendRequest(req.user.id, friend_id);

        if (result.error) {
            const status = result.existing.status;
            return res.status(400).json({
                success: false,
                error: {
                    code: status === 'accepted' ? 'ALREADY_FRIENDS' : 'REQUEST_EXISTS',
                    message: status === 'accepted' ? 'Already friends' : 'Friend request already exists'
                }
            });
        }

        res.status(201).json({
            success: true,
            data: result.data,
            message: 'Friend request sent'
        });
    } catch (error) {
        console.error('Send request error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /friends/{requestId}/accept:
 *   put:
 *     summary: Accept friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request accepted
 *       404:
 *         description: Request not found
 */
exports.acceptRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        const request = await Friend.acceptRequest(requestId, req.user.id);

        if (!request) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Friend request not found' }
            });
        }

        res.json({
            success: true,
            data: request,
            message: 'Friend request accepted'
        });
    } catch (error) {
        console.error('Accept request error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /friends/{requestId}/reject:
 *   put:
 *     summary: Reject friend request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: requestId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Request rejected
 */
exports.rejectRequest = async (req, res) => {
    try {
        const { requestId } = req.params;

        await Friend.rejectRequest(requestId, req.user.id);

        res.json({
            success: true,
            message: 'Friend request rejected'
        });
    } catch (error) {
        console.error('Reject request error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /friends/{friendId}:
 *   delete:
 *     summary: Remove friend or cancel request
 *     tags: [Friends]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: friendId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Removed successfully
 *       404:
 *         description: Not found
 */
exports.removeFriend = async (req, res) => {
    try {
        const { friendId } = req.params;

        // Use removeById to delete any friendship/request by ID (works for both accepted and pending)
        const deleted = await Friend.removeById(friendId, req.user.id);

        if (!deleted) {
            return res.status(404).json({
                success: false,
                error: { code: 'NOT_FOUND', message: 'Friend request or friendship not found' }
            });
        }

        res.json({
            success: true,
            message: 'Removed successfully'
        });
    } catch (error) {
        console.error('Remove friend error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};

/**
 * @swagger
 * /friends/status/{userId}:
 *   get:
 *     summary: Check friendship status
 *     tags: [Friends]
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
 *         description: Status info
 */
exports.checkStatus = async (req, res) => {
    try {
        const { userId } = req.params;

        const status = await Friend.checkStatus(req.user.id, userId);

        res.json({
            success: true,
            data: status
        });
    } catch (error) {
        console.error('Check status error:', error);
        res.status(500).json({
            success: false,
            error: { code: 'SERVER_ERROR', message: 'Internal server error' }
        });
    }
};
