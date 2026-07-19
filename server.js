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

app.use("/api/admin", adminRoutes);

app.use("/api/auth", authRoutes);
app.use("/api/profile", profileRoutes);
app.use("/api/match", matchRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/deals", dealRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/report", reportRoutes);

// Socket.io logic
const onlineUsers = new Map(); // store online users

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  // User joins with their userId
  socket.on("join", (userId) => {
    onlineUsers.set(userId, socket.id);
    console.log("User joined:", userId);
  });

  // Send message in real time
  socket.on(
    "sendMessage",
    ({ conversationId, senderId, receiverId, message }) => {
      const receiverSocketId = onlineUsers.get(receiverId);
      if (receiverSocketId) {
        io.to(receiverSocketId).emit("receiveMessage", {
          conversationId,
          senderId,
          message,
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
