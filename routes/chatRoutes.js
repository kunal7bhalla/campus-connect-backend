const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  sendMessage,
  getMessages,
  getConversations,
  markAsRead,
  searchGifs,
} = require('../controllers/chatController');

// Send message
router.post('/send', authMiddleware, sendMessage);

// Get all conversations
router.get('/conversations', authMiddleware, getConversations);

// Get messages with a specific user
router.get('/:userId', authMiddleware, getMessages);

// Mark messages as read
router.put('/read/:userId', authMiddleware, markAsRead);

// router.get('/gif-search', authMiddleware, searchGifs);

module.exports = router;