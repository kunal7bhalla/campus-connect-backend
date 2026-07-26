const mongoose = require('mongoose');

const feedPostSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    imageUrl: {
      type: String,
      required: true,
    },
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },
    ],
    reports: [
      {
        reporter: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        reason: { type: String, default: 'Inappropriate Content' },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model('FeedPost', feedPostSchema);