const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    conversationId: {
      type: String,
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    message: {
      type: String,
      default: "", // Changed from required: true to allow image-only messages
    },
    imageUrl: {
      type: String,
      default: null,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "gif"],
      default: "text",
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    isEncrypted: {
      type: Boolean,
      default: true,
    },
    isTemporary: {
      type: Boolean,
      default: false,
    },
    // MongoDB TTL Index: Document auto-deletes when expireAt reaches current time
    expireAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

// Create TTL index on expireAt field
messageSchema.index({ expireAt: 1 }, { expireAfterSeconds: 0 });

const Message = mongoose.model("Message", messageSchema);

module.exports = Message;