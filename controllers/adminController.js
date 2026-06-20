const User=require('../models/User');
const Deals=require('../models/Deals');


const getStats= async (req,res)=>{
    try{
        const totalUsers= await User.countDocuments();
        const totalAdmins= await User.countDocuments({isAdmin:true});
        const totalStudents= await User.countDocuments({isAdmin:false});
        const totalDeals= await Deals.countDocuments({isActive:true});

        const sevenDaysAgo= new Date(Date.now() - 7*24*60*60*1000);
        const usersLast7Days = await User.countDocuments({
        lastActive: { $gte: sevenDaysAgo }
      });

        res.status(200).json({
            totalUsers,
            totalAdmins,
            totalStudents,
            totalDeals,
            usersLast7Days,
        });

    }
    catch(err){
        console.error(err);
        res.status(500).json({message:'Server error'});
    }
}

const blockUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found!' });
    user.isBlocked = !user.isBlocked;
    await user.save();
    res.status(200).json({ message: user.isBlocked ? 'User blocked!' : 'User unblocked!' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

const getUsers = async (req, res) => {
  try {
    const users = await User.find({ isVerified: true })
      .select('-password -otp')
      .sort({ createdAt: -1 });
    res.status(200).json({ users });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
}

module.exports = {
    getStats,
    blockUser,
    getUsers,
};