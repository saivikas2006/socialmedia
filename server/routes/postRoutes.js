const express = require("express");
const router = express.Router();

const {
  createPost,
  getPosts,
  getMyPosts,
  getPostsByUser,
  getPostById,
  likePost,
  deletePost,
} = require("../controllers/postController");

const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/upload");

// ================= Create Post =================
router.post("/", protect, upload.single("image"), createPost);

// ================= Get All Posts =================
router.get("/", getPosts);

// ================= Get Logged-in User Posts =================
// Keep BEFORE "/:id"
router.get("/user/me", protect, getMyPosts);

// ================= Get Posts By User ID =================
// Keep BEFORE "/:id"
router.get("/user/:id", protect, getPostsByUser);

// ================= Get Single Post =================
router.get("/:id", getPostById);

// ================= Like / Unlike =================
router.put("/:id/like", protect, likePost);

// ================= Delete Post =================
router.delete("/:id", protect, deletePost);

module.exports = router;