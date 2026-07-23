const express = require('express');
const router = express.Router();
const { reportUser, blockUser } = require('../controllers/reportController');
const { authMiddleware } = require('../middleware/authMiddleware');

// User reporting and blocking routes
router.post('/:id', authMiddleware, reportUser);
router.post('/block/:id', authMiddleware, blockUser);

module.exports = router;