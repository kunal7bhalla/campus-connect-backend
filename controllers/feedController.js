const FeedPost = require('../models/FeedPost');
const User = require('../models/User');

const getFeedPosts = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id);
    const blockedUserIds = currentUser?.blockedUsers || [];

    const posts = await FeedPost.find({
      user: { $nin: blockedUserIds },
    })
      .populate('user', 'fullName profile isBlocked')
      .sort({ createdAt: -1 });

    const cleanPosts = posts.filter((post) => post.user && !post.user.isBlocked);

    res.status(200).json({ posts: cleanPosts });
  } catch (error) {
    console.error('Error fetching feed posts:', error);
    res.status(500).json({ message: 'Server error!' });
  }
};

const createFeedPost = async (req, res) => {
  try {
    const { imageUrl, caption } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ message: 'Image URL is required!' });
    }

    const newPost = await FeedPost.create({
      user: req.user._id,
      imageUrl,
      caption: caption || '',
    });

    const populatedPost = await FeedPost.findById(newPost._id).populate(
      'user',
      'fullName profile'
    );

    res.status(201).json({ message: 'Post created!', post: populatedPost });
  } catch (error) {
    console.error('Error creating feed post:', error);
    res.status(500).json({ message: 'Server error!' });
  }
};

const toggleLikePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const userId = req.user._id;

    const post = await FeedPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found!' });
    }

    const isLiked = post.likes.includes(userId);

    if (isLiked) {
      post.likes = post.likes.filter((id) => id.toString() !== userId.toString());
    } else {
      post.likes.push(userId);
    }

    await post.save();

    res.status(200).json({
      message: isLiked ? 'Unliked' : 'Liked',
      likesCount: post.likes.length,
      isLiked: !isLiked,
    });
  } catch (error) {
    console.error('Error liking post:', error);
    res.status(500).json({ message: 'Server error!' });
  }
};

const reportPost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { reason } = req.body;

    const post = await FeedPost.findById(postId);
    if (!post) {
      return res.status(404).json({ message: 'Post not found!' });
    }

    const alreadyReported = post.reports.some(
      (r) => r.reporter.toString() === req.user._id.toString()
    );

    if (alreadyReported) {
      return res.status(400).json({ message: 'You already reported this post.' });
    }

    post.reports.push({
      reporter: req.user._id,
      reason: reason || 'Inappropriate Content',
    });

    await post.save();

    res.status(200).json({ message: 'Post reported successfully.' });
  } catch (error) {
    console.error('Error reporting post:', error);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = {
  getFeedPosts,
  createFeedPost,
  toggleLikePost,
  reportPost,
};