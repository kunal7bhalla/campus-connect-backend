const express = require("express");
const router = express.Router();
const multer = require("multer");
const storage = multer.memoryStorage();
const upload = multer({ storage });

const { authMiddleware } = require("../middleware/authMiddleware");
const {
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadDealImage,
  deleteDealImage,
  uploadChatImage,
  uploadFeedImage,
  deleteFeedImage,
} = require("../controllers/uploadController");

// Existing routes
router.post("/profile", authMiddleware, upload.single("image"), uploadProfilePhoto);
router.delete("/profile", authMiddleware, deleteProfilePhoto);
router.post("/deal", authMiddleware, upload.single("image"), uploadDealImage);
router.delete("/deal", authMiddleware, deleteDealImage);
router.post("/chat-image", authMiddleware, upload.single("image"), uploadChatImage);

// 🌟 ADD THESE TWO FEED UPLOAD ROUTES
router.post("/feed-image", authMiddleware, upload.single("image"), uploadFeedImage);
router.delete("/feed-image", authMiddleware, deleteFeedImage);

module.exports = router;