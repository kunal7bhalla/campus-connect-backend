const Message = require('../models/Message');
const User = require('../models/User');
const CryptoJS = require('crypto-js');
const axios = require('axios');

const getConversationId = (userId1, userId2) => {
  return [userId1, userId2].sort().join('_');
};

const encryptMessage = (message) => {
  return CryptoJS.AES.encrypt(message, process.env.MESSAGE_SECRET).toString();
};

const decryptMessage = (encryptedMessage) => {
  const bytes = CryptoJS.AES.decrypt(encryptedMessage, process.env.MESSAGE_SECRET);
  return bytes.toString(CryptoJS.enc.Utf8);
};

// @route POST /api/chat/send
const sendMessage = async (req, res) => {
  try {
    const { receiverId, message, messageType } = req.body;
    const type = messageType === 'image' || messageType === 'gif' ? messageType : 'text';

    const currentUser = await User.findById(req.user._id);
    if (!currentUser.matches.includes(receiverId)) {
      return res.status(403).json({ message: 'You can only message matched users!' });
    }

    const conversationId = getConversationId(req.user._id.toString(), receiverId);

    // Only encrypt plain text — image/gif URLs stored as-is
    const storedMessage = type === 'text' ? encryptMessage(message) : message;

    const newMessage = await Message.create({
      conversationId,
      sender: req.user._id,
      receiver: receiverId,
      message: storedMessage,
      messageType: type,
      isEncrypted: type === 'text',
    });

    res.status(201).json({
      message: 'Message sent!',
      data: {
        id: newMessage._id,
        conversationId,
        sender: req.user._id,
        receiver: receiverId,
        message: message,
        messageType: type,
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

    const decryptedMessages = messages.map((msg) => ({
      id: msg._id,
      sender: msg.sender,
      receiver: msg.receiver,
      message: msg.isEncrypted ? decryptMessage(msg.message) : msg.message,
      messageType: msg.messageType,
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
            message: lastMessage.isEncrypted ? decryptMessage(lastMessage.message) : lastMessage.message,
            messageType: lastMessage.messageType,
            createdAt: lastMessage.createdAt,
            isRead: lastMessage.isRead,
            sender: lastMessage.sender,
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

// @route GET /api/chat/gif-search?q=funny
// const searchGifs = async (req, res) => {
//   try {
//     const { q } = req.query;
//     if (!q) {
//       return res.status(400).json({ message: 'Search query required!' });
//     }

//     const response = await axios.get('https://tenor.googleapis.com/v2/search', {
//       params: {
//         q,
//         key: process.env.TENOR_API_KEY,
//         client_key: 'campus_link',
//         limit: 20,
//         media_filter: 'gif',
//       },
//     });

//     const gifs = response.data.results.map((gif) => ({
//       id: gif.id,
//       url: gif.media_formats.gif.url,
//       preview: gif.media_formats.tinygif.url,
//     }));

//     res.status(200).json({ gifs });

//   } catch (error) {
//     console.error(error);
//     res.status(500).json({ message: 'Failed to search GIFs' });
//   }
// };

module.exports = { sendMessage, getMessages, getConversations, markAsRead};