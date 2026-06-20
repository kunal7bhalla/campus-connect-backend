const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getDeals, createDeal, updateDeal, deleteDeal } = require('../controllers/dealController');

// Get all deals — any logged in user
router.get('/', authMiddleware, getDeals);

// Create deal — admin only
router.post('/', authMiddleware, adminMiddleware, createDeal);

// Update deal — admin only
router.put('/:id', authMiddleware, adminMiddleware, updateDeal);

// Delete deal — admin only
router.delete('/:id', authMiddleware, adminMiddleware, deleteDeal);

module.exports = router;