const express = require('express');
const router = express.Router();

// Import controllers
const authController = require('../controllers/authController');
const userController = require('../controllers/userController');
const gameController = require('../controllers/gameController');
const friendController = require('../controllers/friendController');
const messageController = require('../controllers/messageController');
const rankingController = require('../controllers/rankingController');
const adminController = require('../controllers/adminController');

// Import middleware
const { auth, optionalAuth } = require('../middleware/auth');
const adminAuth = require('../middleware/adminAuth');

// ============== AUTH ROUTES ==============
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/logout', auth, authController.logout);
router.get('/auth/me', auth, authController.me);

// ============== USER ROUTES ==============
router.get('/users', auth, userController.search);
router.get('/achievements', auth, userController.getMyAchievements); // Current user achievements
// Current user profile routes (must be before :id routes!)
router.get('/users/profile/stats', auth, userController.getMyStats);
router.put('/users/profile', auth, userController.updateMyProfile);
// User by ID routes
router.get('/users/:id', auth, userController.getProfile);
router.put('/users/:id', auth, userController.updateProfile);
router.get('/users/:id/achievements', auth, userController.getAchievements);

// ============== GAME ROUTES ==============
router.get('/games', auth, gameController.getAll);
router.get('/games/sessions', auth, gameController.getSavedGames);
router.get('/games/:id', optionalAuth, gameController.getById);
router.post('/games/:id/sessions', auth, gameController.createSession);
router.get('/games/sessions/:sessionId', auth, gameController.getSession);
router.put('/games/sessions/:sessionId', auth, gameController.updateSession);
router.post('/games/:id/ratings', auth, gameController.rateGame);
router.get('/games/:id/ratings', optionalAuth, gameController.getRatings);
router.post('/games/:id/comments', auth, gameController.commentGame);
router.get('/games/:id/comments', auth, gameController.getComments);

// ============== FRIEND ROUTES ==============
router.get('/friends', auth, friendController.getFriends);
router.get('/friends/pending', auth, friendController.getPendingRequests);
router.get('/friends/requests', auth, friendController.getPendingRequests); // Alias
router.post('/friends/request', auth, friendController.sendRequest);
router.put('/friends/:requestId/accept', auth, friendController.acceptRequest);
router.put('/friends/:requestId/reject', auth, friendController.rejectRequest);
router.delete('/friends/:friendId', auth, friendController.removeFriend);
router.get('/friends/status/:userId', auth, friendController.checkStatus);

// ============== MESSAGE ROUTES ==============
router.get('/messages/conversations', auth, messageController.getConversations);
router.get('/messages/unread', auth, messageController.getUnreadCount);
router.get('/messages/:userId', auth, messageController.getMessages);
router.post('/messages', auth, messageController.sendMessage);
router.put('/messages/:messageId/read', auth, messageController.markAsRead);

// ============== RANKING ROUTES ==============
router.get('/rankings', auth, rankingController.getGlobalRanking); // All games
router.get('/rankings/:gameId', auth, rankingController.getGlobalRanking);
router.get('/rankings/:gameId/friends', auth, rankingController.getFriendsRanking);
router.get('/rankings/:gameId/personal', auth, rankingController.getPersonalRanking);

// ============== ADMIN ROUTES ==============
router.get('/admin/statistics', auth, adminAuth, adminController.getStatistics);
router.get('/admin/users', auth, adminAuth, adminController.getUsers);
router.put('/admin/users/:id', auth, adminAuth, adminController.updateUser);
router.delete('/admin/users/:id', auth, adminAuth, adminController.deleteUser);
router.get('/admin/games', auth, adminAuth, adminController.getGames);
router.put('/admin/games/:id', auth, adminAuth, adminController.updateGame);

module.exports = router;
