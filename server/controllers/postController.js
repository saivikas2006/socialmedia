const Post = require("../models/Post");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary");

// ================= Create Post =================
exports.createPost = async (req, res) => {
  try {
    const { caption } = req.body;

    if (!caption) {
      return res.status(400).json({
        success: false,
        message: "Caption is required",
      });
    }

    let image = "";

    // ✅ Upload to Cloudinary
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts",
      });

      image = result.secure_url;
    }

    const post = await Post.create({
      user: req.user.id,
      caption,
      image,
    });

    res.status(201).json({
      success: true,
      message: "Post created successfully",
      post,
    });

  } catch (error) {
    console.error("Create Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Get All Posts =================
exports.getPosts = async (req, res) => {
  try {
    const posts = await Post.find()
      .populate("user", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });

  } catch (error) {
    console.error("Get Posts Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Get Logged-in User Posts =================
exports.getMyPosts = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.user.id })
      .populate("user", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });

  } catch (error) {
    console.error("Get My Posts Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Get Posts By User =================
exports.getPostsByUser = async (req, res) => {
  try {
    const posts = await Post.find({ user: req.params.id })
      .populate("user", "name email profilePic")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: posts.length,
      posts,
    });

  } catch (error) {
    console.error("Get Posts By User Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Get Single Post =================
exports.getPostById = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "name email profilePic")
      .populate({
        path: "comments",
        populate: {
          path: "user",
          select: "name profilePic",
        },
      });

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    res.status(200).json({
      success: true,
      post,
    });

  } catch (error) {
    console.error("Get Post By ID Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Like / Unlike =================
exports.likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const userId = req.user.id;

    // Unlike
    if (post.likes.includes(userId)) {
      post.likes.pull(userId);
      await post.save();

      return res.status(200).json({
        success: true,
        message: "Post unliked successfully",
        totalLikes: post.likes.length,
      });
    }

    // Like
    post.likes.push(userId);
    await post.save();

    // Notification
    if (post.user.toString() !== userId) {
      const alreadyExists = await Notification.findOne({
        sender: userId,
        receiver: post.user,
        post: post._id,
        type: "like",
      });

      if (!alreadyExists) {
        await Notification.create({
          sender: userId,
          receiver: post.user,
          post: post._id,
          type: "like",
          message: "liked your post ❤️",
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Post liked successfully",
      totalLikes: post.likes.length,
    });

  } catch (error) {
    console.error("Like Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};

// ================= Delete Post =================
exports.deletePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    if (post.user.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // 🔥 OPTIONAL: Delete image from Cloudinary
    if (post.image) {
      const publicId = post.image.split("/").pop().split(".")[0];
      await cloudinary.uploader.destroy(`posts/${publicId}`);
    }

    await Notification.deleteMany({ post: post._id });
    await post.deleteOne();

    res.status(200).json({
      success: true,
      message: "Post deleted successfully",
    });

  } catch (error) {
    console.error("Delete Post Error:", error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};