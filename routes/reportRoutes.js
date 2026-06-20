const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { reportUser, blockUser } = require('../controllers/reportController');

// Report a user
router.post('/:id', authMiddleware, reportUser);

// Block a user
router.post('/block/:id', authMiddleware, blockUser);

module.exports = router;