const Comment = require("../models/Comment");
const Post = require("../models/Post");
const Notification = require("../models/Notification");

// ================= Add Comment =================
exports.addComment = async (req, res) => {
  try {
    const { comment } = req.body;

    if (!comment) {
      return res.status(400).json({
        success: false,
        message: "Comment is required",
      });
    }

    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({
        success: false,
        message: "Post not found",
      });
    }

    const newComment = await Comment.create({
      post: post._id,
      user: req.user.id,
      comment,
    });

    post.comments.push(newComment._id);

    await post.save();

    // ================= Notification =================
    if (post.user.toString() !== req.user.id) {
      await Notification.create({
        sender: req.user.id,
        receiver: post.user,
        post: post._id,
        type: "comment",
        message: "commented on your post 💬",
      });
    }

    res.status(201).json({
      success: true,
      message: "Comment added successfully",
      comment: newComment,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};
// ================= Get Comments =================
exports.getComments = async (req, res) => {
  try {

    const comments = await Comment.find({
      post: req.params.postId,
    })
      .populate("user", "name profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      count: comments.length,
      comments,
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });
  }
};