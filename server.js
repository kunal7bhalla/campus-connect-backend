const express = require("express");
const http = require("http");
const cors = require("cors");
const dotenv = require("dotenv");
const { Server } = require("socket.io");
const connectDB = require("./config/db");

dotenv.config();

const app = express();
const server = http.createServer(app);

// Socket.io setup
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

// Connect to MongoDB
connectDB();

// Middleware
app.use(cors());
app.use(express.json());

// Health check (for uptime pings / keep-alive)
app.get("/healthz", (req, res) => {
  res.status(200).send("OK");
});

// Routes
const authRoutes = require("./routes/authRoutes");
const profileRoutes = require("./routes/profileRoutes");
const matchRoutes = require("./routes/matchRoutes");
const chatRoutes = require("./routes/chatRoutes");
const dealRoutes = require("./routes/dealRoutes");
const uploadRoutes = require("./routes/uploadRoutes");
const reportRoutes = require("./routes/reportRoutes");
const adminRoutes = require("./routes/adminRoutes");
const feedRoutes = require("./routes/feedRoutes"); // Global photo feed routes

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/report", reportRoutes);
app.use("/api/feed", feedRoutes); // Mount public photo feed API

// Socket.io logic
const onlineUsers = new Map(); // Store online users (userId => socketId)

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with their userId
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User joined:", userId);
  });

  // Send message in real time (Supports text, images, and 24h temporary metadata)
  socket.on(
    "sendMessage",
    ({
      conversationId,
      senderId,
      receiverId,
      message,
      imageUrl,
      messageType,
      expireAt,
      isTemporary,
    }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          conversationId,
          sender: senderId,
          senderId,
          receiver: receiverId,
          message: message || "",
          imageUrl: imageUrl || null,
          messageType: messageType || (imageUrl ? "image" : "text"),
          isTemporary: isTemporary || !!imageUrl,
          expireAt: expireAt || (imageUrl ? new Date(Date.now() + 24 * 60 * 60 * 1000) : null),
          createdAt: new Date(),
        });
      }
    },
  );

  // Typing indicator
  socket.on("typing", ({ receiverId, senderName }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("typing", { senderName });
    }
  });

  // Stop typing
  socket.on("stopTyping", ({ receiverId }) => {
    const receiverSocketId = onlineUsers.get(receiverId);
    if (receiverSocketId) {
      io.to(receiverSocketId).emit("stopTyping");
    }
  });

  // User disconnects
  socket.on("disconnect", () => {
    onlineUsers.forEach((socketId, userId) => {
      if (socketId === socket.id) {
        onlineUsers.delete(userId);
        console.log("User disconnected:", userId);
      }
    });
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});