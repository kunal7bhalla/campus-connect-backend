const Message = require('../models/Message');
const User = require('../models/User');
const CryptoJS = require('crypto-js');

// Generate unique conversation ID from two user IDs
const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

// Encrypt message
const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, process.env.MESSAGE_SECRET).toString();
};

// Decrypt message
const decryptMessage = (encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, process.env.MESSAGE_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// @route POST /api/chat/send
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message } = req.body;

    // Check if users are matched
    const currentUser = await User.findById(req.user._id);
    if (!currentUser.matches.includes(receiverId)) {
      return res.status(403).json({ message: 'You can only message matched users!' });
    }

    // Generate conversation ID
    const conversationId = getConversationId(req.user._id.toString(), receiverId);

    // Encrypt message
    const encryptedMessage = encryptMessage(message);

    // Save message
    const newMessage = await Message.create({
      conversationId,
      sender: req.user._id,
      receiver: receiverId,
      message: encryptedMessage,
    });

    res.status(201).json({
      message: 'Message sent!',
      data: {
        id: newMessage._id,
        conversationId,
        sender: req.user._id,
        receiver: receiverId,
        message: message, // send original to sender
        createdAt: newMessage.createdAt,
      },
    });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route GET /api/chat/:userId
const getMessages = async (req, res) => {
  try {
    const conversationId = getConversationId(
      req.user._id.toString(),
      req.params.userId
    );

    const messages = await Message.find({ conversationId })
      .sort({ createdAt: 1 });

    // Decrypt messages
    const decryptedMessages = messages.map((msg) => ({
      id: msg._id,
      sender: msg.sender,
      receiver: msg.receiver,
      message: decryptMessage(msg.message),
      isRead: msg.isRead,
      createdAt: msg.createdAt,
    }));

    res.status(200).json({ messages: decryptedMessages });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route GET /api/chat/conversations
const getConversations = async (req, res) => {
  try {
    const currentUser = await User.findById(req.user._id)
      .populate('matches', '-password -otp -likes');

    // For each match get the last message
    const conversations = await Promise.all(
      currentUser.matches.map(async (match) => {
        const conversationId = getConversationId(
          req.user._id.toString(),
          match._id.toString()
        );

        const lastMessage = await Message.findOne({ conversationId })
          .sort({ createdAt: -1 });

        return {
          user: match,
          lastMessage: lastMessage ? {
            message: decryptMessage(lastMessage.message),
            createdAt: lastMessage.createdAt,
            isRead: lastMessage.isRead,
          } : null,
        };
      })
    );

    res.status(200).json({ conversations });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

// @route PUT /api/chat/read/:userId
const markAsRead = async (req, res) => {
  try {
    const conversationId = getConversationId(
      req.user._id.toString(),
      req.params.userId
    );

    await Message.updateMany(
      {
        conversationId,
        receiver: req.user._id,
        isRead: false,
      },
      { isRead: true }
    );

    res.status(200).json({ message: 'Messages marked as read!' });

  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Server error!' });
  }
};

module.exports = { sendMessage, getMessages, getConversations, markAsRead };