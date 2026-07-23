const Report = require('../models/Report');
const User = require('../models/User');

// Fetch all reports with populated user details
const getAllReports = async (req, res) => {
  try {
    const reports = await Report.find()
      .populate('reporter', 'fullName email profile')
      .populate('reportedUser', 'fullName email isBlocked profile')
      .sort({ createdAt: -1 });

    res.status(200).json({ reports });
  } catch (error) {
    console.error('Error fetching admin reports:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Update status of a report (pending, reviewed, dismissed)
const updateReportStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const { reportId } = req.params;

    if (!['pending', 'reviewed', 'dismissed'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }

    const report = await Report.findByIdAndUpdate(
      reportId,
      { status },
      { new: true }
    );

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ message: 'Report status updated', report });
  } catch (error) {
    console.error('Error updating report status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

// Delete/Dismiss report
const deleteReport = async (req, res) => {
  try {
    const { reportId } = req.params;
    const report = await Report.findByIdAndDelete(reportId);

    if (!report) {
      return res.status(404).json({ message: 'Report not found' });
    }

    res.status(200).json({ message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getAllReports,
  updateReportStatus,
  deleteReport,
};