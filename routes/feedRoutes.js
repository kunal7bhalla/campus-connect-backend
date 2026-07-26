const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getFeedPosts,
  createFeedPost,
  toggleLikePost,
  reportPost,
  getUserFeedPosts,
  deleteFeedPost,
} = require('../controllers/feedController');

router.get('/', authMiddleware, getFeedPosts);
router.post('/', authMiddleware, createFeedPost);
router.get('/user/:userId', authMiddleware, getUserFeedPosts);
router.put('/:postId/like', authMiddleware, toggleLikePost);
router.post('/:postId/report', authMiddleware, reportPost);
router.delete('/:postId', authMiddleware, deleteFeedPost);

module.exports = router;