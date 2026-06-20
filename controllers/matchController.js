const User = require('../models/User');

// @route POST /api/match/like/:id
const likeUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const likedUser = await User.findById(req.params.id);

    if (!likedUser) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Check if already liked
    if (currentUser.likes.includes(likedUser._id)) {
      return res.status(400).json({ message: 'Already liked this user!' });
    }

    // Add to likes
    currentUser.likes.push(likedUser._id);
    await currentUser.save();

    // Check if other user already liked current user → match!
    if (likedUser.likes.includes(currentUser._id)) {
      // Add to matches for both users
      currentUser.matches.push(likedUser._id);
      likedUser.matches.push(currentUser._id);

      await currentUser.save();
      await likedUser.save();

      return res.status(200).json({
        message: 'Its a match! 🎉',
        matched: true,
        matchedUser: {
          id: likedUser._id,
          fullName: likedUser.fullName,
          profile: likedUser.profile,
        },
      });
    }

    res.status(200).json({
      message: 'User liked successfully!',
      matched: false,
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route GET /api/match/matches
const getMatches = async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .populate('matches', '-password -otp -likes');

    if (!user) {
      return res.status(404).json({ message: 'User not found!' });
    }

    res.status(200).json({ matches: user.matches });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route DELETE /api/match/unmatch/:id
const unmatchUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const otherUser = await User.findById(req.params.id);

    if (!otherUser) {
      return res.status(404).json({ message: 'User not found!' });
    }

    // Remove from matches for both users
    currentUser.matches = currentUser.matches.filter(
      (id) => id.toString() !== req.params.id
    );
    otherUser.matches = otherUser.matches.filter(
      (id) => id.toString() !== req.user._id.toString()
    );

    await currentUser.save();
    await otherUser.save();

    res.status(200).json({ message: 'Unmatched successfully!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { likeUser, getMatches, unmatchUser };