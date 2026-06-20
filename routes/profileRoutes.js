const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');

const {
  setupProfile,
  getMyProfile,
  updateProfile,
  browseProfiles,
  getProfileById,
  changePassword,
  deleteAccount
} = require('../controllers/profileController');

// Setup profile
router.put('/setup', authMiddleware, setupProfile);

// Get my profile
router.get('/me', authMiddleware, getMyProfile);

// Update profile
router.put('/update', authMiddleware, updateProfile);

// Browse profiles
router.get('/browse', authMiddleware, browseProfiles);

// Get profile by id
router.get('/:id', authMiddleware, getProfileById);

// Change password
router.put('/change-password', authMiddleware, changePassword);

// Delete account
router.delete('/delete', authMiddleware, deleteAccount);

module.exports = router;