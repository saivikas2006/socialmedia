const express = require("express");
const router = express.Router();

const {
  getProfile,
  getUserById,
  updateProfile,
  followUser,
  searchUsers,
} = require("../controllers/userController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ================= Logged-in User Profile =================
router.get("/profile", protect, getProfile);

// ================= Update Profile =================
router.put(
  "/profile",
  protect,
  upload.single("profilePic"),
  updateProfile
);

// ================= Search Users =================
router.get("/search", protect, searchUsers);

// ================= Get User By ID =================
// IMPORTANT: Keep this BEFORE any dynamic routes that could conflict.
router.get("/:id", protect, getUserById);

// ================= Follow / Unfollow =================
router.put("/follow/:id", protect, followUser);

module.exports = router;