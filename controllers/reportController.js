const Report = require('../models/Report');
const User = require('../models/User');

const REPORT_BAN_THRESHOLD = 8; // Auto-bans user if reports > 8

// Report a user
const reportUser = async (req, res) => {
  try {
    const { reason } = req.body;
    const targetUserId = req.params.id;

    const reportedUser = await User.findById(targetUserId);

    if (!reportedUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (targetUserId.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot report yourself' });
    }

    if (!reason || !reason.trim()) {
      return res
        .status(400)
        .json({ message: 'Please provide a reason for the report' });
    }

    // 1. Create and save the report
    await Report.create({
      reporter: req.user._id,
      reportedUser: targetUserId,
      reason: reason.trim(),
    });

    // 2. Count active non-dismissed reports against this user
    const activeReportCount = await Report.countDocuments({
      reportedUser: targetUserId,
      status: { $ne: 'dismissed' },
    });

    // 3. Auto-ban account if reports exceed 8
    let autoBanned = false;
    if (activeReportCount > REPORT_BAN_THRESHOLD && !reportedUser.isBlocked) {
      reportedUser.isBlocked = true;
      await reportedUser.save();
      autoBanned = true;
      console.log(
        `🚨 Auto-banned user ${targetUserId} (${reportedUser.fullName}) for accumulating ${activeReportCount} reports.`
      );
    }

    return res.status(200).json({
      message: autoBanned
        ? 'User reported and automatically banned due to multiple flags.'
        : 'User reported successfully.',
      totalReports: activeReportCount,
      autoBanned,
    });
  } catch (error) {
    console.error('Error reporting user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Block a user locally from current user's feed & matches
const blockUser = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const userToBlock = await User.findById(req.params.id);

    if (!userToBlock) {
      return res.status(404).json({ message: 'User not found' });
    }

    if (req.params.id.toString() === req.user._id.toString()) {
      return res.status(400).json({ message: 'You cannot block yourself' });
    }

    // Filter out matches from both user profiles
    currentUser.matches = currentUser.matches.filter(
      (match) => match.toString() !== req.params.id.toString()
    );

    userToBlock.matches = userToBlock.matches.filter(
      (match) => match.toString() !== req.user._id.toString()
    );

    // Add to current user's blocked list
    if (!currentUser.blockedUsers.includes(req.params.id)) {
      currentUser.blockedUsers.push(req.params.id);
    }

    await currentUser.save();
    await userToBlock.save();

    res.status(200).json({ message: 'User blocked successfully' });
  } catch (error) {
    console.error('Error blocking user:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = { reportUser, blockUser };