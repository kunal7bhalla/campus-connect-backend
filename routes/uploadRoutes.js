const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { upload } = require('../utils/cloudinary');
const {
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadDealImage,
  deleteDealImage,
} = require('../controllers/uploadController');

// Upload profile photo
router.post('/profile-photo', authMiddleware, upload.single('photo'), uploadProfilePhoto);

// Delete profile photo
router.delete('/profile-photo', authMiddleware, deleteProfilePhoto);

// Upload deal image — admin only
router.post('/deal-image', authMiddleware, adminMiddleware, upload.single('image'), uploadDealImage);

// Delete deal image — admin only
router.delete('/deal-image', authMiddleware, adminMiddleware, deleteDealImage);

module.exports = router;