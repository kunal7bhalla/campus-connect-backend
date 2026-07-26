const User = require("../models/User");
const Deal = require("../models/Deals");
const FeedPost = require("../models/FeedPost"); // Updated to match FeedPosts.js
const {
  uploadToCloudinary,
  deleteFromCloudinary,
} = require("../utils/cloudinary");

// Upload profile photo
const uploadProfilePhoto = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    if (user.profile.photos.length >= 3) {
      return res.status(400).json({ message: "Maximum 3 photos allowed!" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "profiles");

    user.profile.photos.push(imageUrl);
    await user.save();

    res.status(200).json({
      message: "Photo uploaded successfully!",
      imageUrl,
      photos: user.profile.photos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

// Delete profile photo
const deleteProfilePhoto = async (req, res) => {
  try {
    const { imageUrl } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: "User not found!" });
    }

    await deleteFromCloudinary(imageUrl);

    user.profile.photos = user.profile.photos.filter(
      (photo) => photo !== imageUrl,
    );
    await user.save();

    res.status(200).json({
      message: "Photo deleted successfully!",
      photos: user.profile.photos,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

// Upload deal image
const uploadDealImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "deals");

    res.status(200).json({
      message: "Deal image uploaded successfully!",
      imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

// Delete deal image
const deleteDealImage = async (req, res) => {
  try {
    const { imageUrl, dealId } = req.body;

    await deleteFromCloudinary(imageUrl);

    if (dealId) {
      const deal = await Deal.findById(dealId);
      if (deal) {
        deal.image = null;
        await deal.save();
      }
    }

    res.status(200).json({ message: "Deal image deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

// Upload chat image
const uploadChatImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "chat");

    res.status(200).json({
      message: "Chat image uploaded successfully!",
      imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

// Upload public feed image
const uploadFeedImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded!" });
    }

    const imageUrl = await uploadToCloudinary(req.file.buffer, "feed");

    res.status(200).json({
      message: "Feed photo uploaded successfully!",
      imageUrl,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

// Delete public feed image
const deleteFeedImage = async (req, res) => {
  try {
    const { imageUrl, postId } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: "Image URL is required!" });
    }

    await deleteFromCloudinary(imageUrl);

    if (postId) {
      await FeedPost.findByIdAndDelete(postId);
    }

    res.status(200).json({ message: "Feed post deleted successfully!" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error!" });
  }
};

module.exports = {
  uploadProfilePhoto,
  deleteProfilePhoto,
  uploadDealImage,
  deleteDealImage,
  uploadChatImage,
  uploadFeedImage,
  deleteFeedImage,
};