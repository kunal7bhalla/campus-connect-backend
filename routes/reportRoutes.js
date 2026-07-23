const express = require('express');
const router = express.Router();
const { auth } = require('../middleware/auth');
const { reportUser, blockUser } = require('../controllers/reportController');

// User reporting and blocking routes
router.post('/:id', auth, reportUser);
router.post('/block/:id', auth, blockUser);

module.exports = router;