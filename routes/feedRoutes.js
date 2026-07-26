const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const {
  getFeedPosts,
  createFeedPost,
  toggleLikePost,
  reportPost,
} = require('../controllers/feedController');

router.get('/', authMiddleware, getFeedPosts);
router.post('/', authMiddleware, createFeedPost);
router.put('/:postId/like', authMiddleware, toggleLikePost);
router.post('/:postId/report', authMiddleware, reportPost);

module.exports = router;