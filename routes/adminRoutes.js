const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getStats, blockUser, getUsers } = require('../controllers/adminController');
const {
  getAllReports,
  updateReportStatus,
  deleteReport,
} = require('../controllers/adminreportController');

// System & Analytics Stats
router.get('/stats', authMiddleware, adminMiddleware, getStats);

// User Management
router.get('/users', authMiddleware, adminMiddleware, getUsers);
router.put('/block/:id', authMiddleware, adminMiddleware, blockUser);

// Moderation & Reports
router.get('/reports', authMiddleware, adminMiddleware, getAllReports);
router.put('/reports/:reportId/status', authMiddleware, adminMiddleware, updateReportStatus);
router.delete('/reports/:reportId', authMiddleware, adminMiddleware, deleteReport);

module.exports = router;