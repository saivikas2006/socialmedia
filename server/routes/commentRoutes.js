const express = require("express");
const router = express.Router();

const {
  addComment,
  getComments,
} = require("../controllers/commentController");

const { protect } = require("../middleware/authMiddleware");

// Add Comment
router.post("/:postId", protect, addComment);

// Get Comments
router.get("/:postId", getComments);

module.exports = router;