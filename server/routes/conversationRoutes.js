const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  createConversation,
  getConversations,
  getConversation,
} = require("../controllers/conversationController");

// Create Conversation
router.post("/", protect, createConversation);

// Get My Conversations
router.get("/", protect, getConversations);

// Get Single Conversation
router.get("/:id", protect, getConversation);

module.exports = router;