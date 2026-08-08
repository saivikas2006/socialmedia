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
// Socket.IO
// ==================================================

const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    methods: ["GET", "POST"],
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

  // ==================================================
  // Add User
  // ==================================================

  socket.on("addUser", (userId) => {
    if (!userId) return;

    // Remove old socket for this user
    onlineUsers = onlineUsers.filter(
      (user) => user.userId !== userId
    );

    // Add current socket
    onlineUsers.push({
      userId,
      socketId: socket.id,
    });

    // Send online users to everyone
    io.emit("onlineUsers", onlineUsers);

    console.log("👤 Online Users:", onlineUsers);
  });

  // ==================================================
  // Send Message
  // ==================================================

  socket.on("sendMessage", (data) => {
    try {
      const receiver = onlineUsers.find(
        (user) => user.userId === data.receiverId
      );

      if (receiver) {
        io.to(receiver.socketId).emit(
          "receiveMessage",
          data
        );
      }
    } catch (error) {
      console.log(
        "❌ Socket message error:",
        error.message
      );
    }
  });

  // ==================================================
  // Message Delivered
  // ==================================================

  socket.on("messageDelivered", (data) => {
    try {
      const sender = onlineUsers.find(
        (user) => user.userId === data.senderId
      );

      if (sender) {
        io.to(sender.socketId).emit(
          "messageDelivered",
          {
            messageId: data.messageId,
            conversationId: data.conversationId,
          }
        );
      }
    } catch (error) {
      console.log(
        "❌ Delivered socket error:",
        error.message
      );
    }
  });

  // ==================================================
  // Message Seen
  // ==================================================

  socket.on("messageSeen", (data) => {
    try {
      const sender = onlineUsers.find(
        (user) => user.userId === data.senderId
      );

      if (sender) {
        io.to(sender.socketId).emit(
          "messageSeen",
          {
            messageId: data.messageId,
            conversationId: data.conversationId,
          }
        );
      }
    } catch (error) {
      console.log(
        "❌ Seen socket error:",
        error.message
      );
    }
  });

  // ==================================================
  // Conversation Seen
  // ==================================================

  socket.on("conversationSeen", (data) => {
    try {
      const sender = onlineUsers.find(
        (user) => user.userId === data.senderId
      );

      if (sender) {
        io.to(sender.socketId).emit(
          "conversationSeen",
          {
            conversationId: data.conversationId,
          }
        );
      }
    } catch (error) {
      console.log(
        "❌ Conversation seen error:",
        error.message
      );
    }
  });

  // ==================================================
  // Typing
  // ==================================================

  socket.on(
    "typing",
    ({ senderId, receiverId }) => {
      const receiver = onlineUsers.find(
        (user) => user.userId === receiverId
      );

      if (receiver) {
        io.to(receiver.socketId).emit(
          "typing",
          senderId
        );
      }
    }
  );

  // ==================================================
  // Stop Typing
  // ==================================================

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

  // ==================================================
  // Disconnect
  // ==================================================

  socket.on("disconnect", () => {
    onlineUsers = onlineUsers.filter(
      (user) => user.socketId !== socket.id
    );

    io.emit("onlineUsers", onlineUsers);

    console.log(
      "🔴 User Disconnected:",
      socket.id
    );
  });
});

// ==================================================
// Middleware
// ==================================================

app.use(
  cors({
    origin: "http://localhost:5173",
  })
);

app.use(express.json());

// ==================================================
// Uploads
// ==================================================

app.use(
  "/uploads",
  express.static(
    path.join(__dirname, "uploads")
  )
);

// ==================================================
// Test Route
// ==================================================

app.get("/", (req, res) => {
  res.send("🚀 ConnectHub API is Running...");
});

// ==================================================
// API Routes
// ==================================================

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/posts", postRoutes);

app.use("/api/comments", commentRoutes);

app.use("/api/notifications", notificationRoutes);

app.use(
  "/api/conversations",
  conversationRoutes
);

app.use(
  "/api/messages",
  messageRoutes
);

// ==================================================
// MongoDB
// ==================================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ MongoDB Connected");
  })
  .catch((err) => {
    console.log(
      "❌ MongoDB Error:",
      err.message
    );
  });

// ==================================================
// Start Server
// ==================================================

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(
    `🚀 Server running on http://localhost:${PORT}`
  );
});