const User= require('../models/User');

// report user
const reportUser = async (req, res) => {
    try{
        const {reson} = req.body;

        const reportedUser = await User.findById(req.params.id);

        if(!reportedUser){
            return res.status(404).json({ message: 'User not found' });
        }

        if(req.params.id===req.user._id){
            return res.status(400).json({ message: 'You cannot report yourself' });
        }

        res.status(200).json({ message: 'User reported successfully' });

    }
    catch(error){
        console.error('Error reporting user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

// block user

const blockUser = async (req, res) => {
    try{

        const currentUser = await User.findById(req.user._id);
        const userToBlock = await User.findById(req.params.id);

        if(!userToBlock){
            return res.status(404).json({ message: 'User not found' });
        }
        if(req.params.id===req.user._id){
            return res.status(400).json({ message: 'You cannot block yourself' });
        }

        currentUser.matches=currentUser.matches.filter(match => match.toString() !== req.params.id);

        blocked.matches=blocked.matches.filter(match => match.toString() !== req.user._id);

        await currentUser.save();
        await userToBlock.save();

        res.status(200).json({ message: 'User blocked successfully' });

    }
    catch(error){
        console.error('Error blocking user:', error);
        res.status(500).json({ message: 'Server error' });
    }
}

module.exports = { reportUser, blockUser };