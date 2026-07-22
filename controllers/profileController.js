const User = require('../models/User');
const message=require('../models/Message');
const bcrypt = require('bcryptjs');

// @route PUT /api/profile/setup
const setupProfile = async (req, res) => {
  try {
    const { age, gender, department, lookingFor, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    user.profile = {
      age,
      gender,
      department,
      lookingFor,
      bio,
      photos: user.profile.photos || [],
    };

    await user.save();

    res.status(200).json({
      message: 'Profile setup successfully!',
      profile: user.profile,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route GET /api/profile/me
const getMyProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp');

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route PUT /api/profile/update
const updateProfile = async (req, res) => {
  try {
    const { age, gender, department, lookingFor, bio } = req.body;

    const user = await User.findById(req.user._id);
    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    user.profile.age = age || user.profile.age;
    user.profile.gender = gender || user.profile.gender;
    user.profile.department = department || user.profile.department;
    user.profile.lookingFor = lookingFor || user.profile.lookingFor;
    user.profile.bio = bio || user.profile.bio;

    await user.save();

    res.status(200).json({
      message: 'Profile updated successfully!',
      profile: user.profile,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

const browseProfiles = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);

    const excludedIds = [
      req.user._id,
      ...currentUser.matches,
      ...currentUser.blockedUsers,
      ...currentUser.likes,       // ← add this: exclude already-liked users too
    ];

    const users = await User.find({
      _id: { $nin: excludedIds },
      blockedUsers: { $ne: req.user._id },
      isVerified: true,
      isBlocked: false,
      'profile.age': { $exists: true },
    }).select('-password -otp');

    res.status(200).json({ users });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route GET /api/profile/:id
const getProfileById = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password -otp');

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json({ user });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// change password

const changePassword = async (req, res) => {
  try{

    const { currentPassword, newPassword } = req.body;

    const user = await User.findById(req.user._id);

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Check current password

    if (!await bcrypt.compare(currentPassword, user.password)) {
      return res.status(400).json({ message: 'Current password is incorrect!' });
    }

    // Update to new password
    user.password = await bcrypt.hash(newPassword, 10);
    await user.save();

    res.status(200).json({ message: 'Password changed successfully!' });

  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
}

// delete account

const deleteAccount = async (req, res) => {
  try{

      const user = await User.findById(req.user._id);
      if (!user) {
        return res.status(404).json({ message: 'User not found!' });
      }

      // Delete all messages involving the user
      await message.deleteMany({ 
        $or: [
          { sender: req.user._id }, 
          { receiver: req.user._id }
        ] 
      });

      await User.updateMany(
      {
        matches: req.user._id
      },
      {
        $pull: {
          matches: req.user._id
        }
      }
    );

      await User.findByIdAndDelete(req.user._id);

      res.status(200).json({ message: 'Account deleted successfully!' });
  }
  catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
}

module.exports = {
  setupProfile,
  getMyProfile,
  updateProfile,
  browseProfiles,
  getProfileById,
  changePassword,
  deleteAccount
};