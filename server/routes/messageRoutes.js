const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  sendMessage,
  getMessages,
  markDelivered,
  markSeen,
  markConversationSeen,
  deleteMessage,
} = require("../controllers/messageController");

// ================= Send Message =================
router.post("/", protect, sendMessage);

// ================= Get Messages =================
router.get("/:id", protect, getMessages);

// ================= Mark Entire Conversation Seen =================
// IMPORTANT: Keep this BEFORE /:id/seen
router.put(
  "/conversation/:id/seen",
  protect,
  markConversationSeen
);

// ================= Mark Message Delivered =================
router.put(
  "/:id/delivered",
  protect,
  markDelivered
);

// ================= Mark Message Seen =================
router.put(
  "/:id/seen",
  protect,
  markSeen
);

// ================= Delete Message =================
router.delete(
  "/:id",
  protect,
  deleteMessage
);

module.exports = router;