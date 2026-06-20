const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { likeUser, getMatches, unmatchUser } = require('../controllers/matchController');

// Like a user
router.post('/like/:id', authMiddleware, likeUser);

// Get all matches
router.get('/matches', authMiddleware, getMatches);

// Unmatch a user
router.delete('/unmatch/:id', authMiddleware, unmatchUser);

module.exports = router;