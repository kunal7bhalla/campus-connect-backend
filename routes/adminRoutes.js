const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getStats, blockUser,getUsers } = require('../controllers/adminController');

// Get stats
router.get('/stats', authMiddleware, adminMiddleware, getStats);

// Block/unblock user
router.put('/block/:id', authMiddleware, adminMiddleware, blockUser);

router.get('/users', authMiddleware, adminMiddleware, getUsers);

module.exports = router;