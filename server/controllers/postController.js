const Post = require("../models/Post");
const Notification = require("../models/Notification");
const cloudinary = require("../config/cloudinary"); // ✅ ADD THIS

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

    // ✅ Upload to Cloudinary instead of local uploads
    if (req.file) {
      const result = await cloudinary.uploader.upload(req.file.path, {
        folder: "posts",
      });

      image = result.secure_url; // ✅ THIS IS IMPORTANT
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
    console.error(error);
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};