const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

require("dotenv").config();

// ==================================================
// Import Routes
// ==================================================
const authRoutes = require("./routes/authRoutes");
const userRoutes = require("./routes/userRoutes");
const postRoutes = require("./routes/postRoutes");
const commentRoutes = require("./routes/commentRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const conversationRoutes = require("./routes/conversationRoutes");
const messageRoutes = require("./routes/messageRoutes");

const app = express();
const server = http.createServer(app);

// ==================================================
// ✅ CORS CONFIG (FIXED)
// ==================================================
const allowedOrigins = [
  "http://localhost:5173", // local frontend
  "https://connecthub-tz3s.onrender.com", // deployed frontend
];

// ==================================================
// Socket.IO
// ==================================================
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true,
  },
});

// ==================================================
// Online Users
// ==================================================
let onlineUsers = [];

// ==================================================
// Socket Connection
// ==================================================
io.on("connection", (socket) => {
  console.log("🟢 User Connected:", socket.id);

  // Add User
  socket.on("addUser", (userId) => {
    if (!userId) return;

    onlineUsers = onlineUsers.filter(
      (user) => user.userId !== userId
    );

    onlineUsers.push({
      userId,
      socketId: socket.id,
    });

    io.emit("onlineUsers", onlineUsers);
  });

  // Send Message
  socket.on("sendMessage", (data) => {
    const receiver = onlineUsers.find(
      (user) => user.userId === data.receiverId
    );

    if (receiver) {
      io.to(receiver.socketId).emit(
        "receiveMessage",
        data
      );
    }
  });

  // Delivered
  socket.on("messageDelivered", (data) => {
    const sender = onlineUsers.find(
      (user) => user.userId === data.senderId
    );

    if (sender) {
      io.to(sender.socketId).emit(
        "messageDelivered",
        data
      );
    }
  });

  // Seen
  socket.on("messageSeen", (data) => {
    const sender = onlineUsers.find(
      (user) => user.userId === data.senderId
    );

    if (sender) {
      io.to(sender.socketId).emit(
        "messageSeen",
        data
      );
    }
  });

  // Typing
  socket.on("typing", ({ senderId, receiverId }) => {
    const receiver = onlineUsers.find(
      (user) => user.userId === receiverId
    );

    if (receiver) {
      io.to(receiver.socketId).emit(
        "typing",
        senderId
      );
    }
  });

  // Stop Typing
  socket.on(
    "stopTyping",
    ({ senderId, receiverId }) => {
      const receiver = onlineUsers.find(
        (user) => user.userId === receiverId
      );

      if (receiver) {
        io.to(receiver.socketId).emit(
          "stopTyping",
          senderId
        );
      }
    }
  );

  // Disconnect
  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(
      (user) => user.socketId !== socket.id
    );

    io.emit("onlineUsers", onlineUsers);
    console.log("🔴 User Disconnected:", socket.id);
  });
});

// ==================================================
// Middleware
// ==================================================
app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json());

// ==================================================
// Static Uploads
// ==================================================
app.use(
  "/uploads",
  express.static(path.join(__dirname, "uploads"))
);

// ==================================================
// Test Route
// ==================================================
app.get("/", (req, res) => {
  res.send("🚀 ConnectHub API is Running...");
});

// ==================================================
// Routes
// ==================================================
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/conversations", conversationRoutes);
app.use("/api/messages", messageRoutes);

// ==================================================
// MongoDB
// ==================================================
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) =>
    console.log("❌ MongoDB Error:", err.message)
  );

// ==================================================
// Start Server
// ==================================================
const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});