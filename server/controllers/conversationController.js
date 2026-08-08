const Conversation = require("../models/Conversation");

// =======================================
// Create Conversation
// =======================================
exports.createConversation = async (req, res) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(400).json({
        success: false,
        message: "Receiver ID is required",
      });
    }

    // Don't allow chatting with yourself
    if (receiverId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "You cannot chat with yourself",
      });
    }

    // Check if conversation already exists
    let conversation = await Conversation.findOne({
      members: {
        $all: [req.user.id, receiverId],
      },
    });

    if (conversation) {
      return res.status(200).json({
        success: true,
        conversation,
      });
    }

    conversation = await Conversation.create({
      members: [req.user.id, receiverId],
    });

    res.status(201).json({
      success: true,
      conversation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================================
// Get My Conversations
// =======================================
exports.getConversations = async (req, res) => {
  try {
    const conversations = await Conversation.find({
      members: req.user.id,
    })
      .populate("members", "name email profilePic")
      .sort({ updatedAt: -1 });

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================================
// Get One Conversation
// =======================================
exports.getConversation = async (req, res) => {
  try {
    const conversation = await Conversation.findById(
      req.params.id
    ).populate("members", "name email profilePic");

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};