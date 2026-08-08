const Message = require("../models/Message");
const Conversation = require("../models/Conversation");

// =======================================
// Send Message
// =======================================
exports.sendMessage = async (req, res) => {
  try {
    const { conversationId, text, image } = req.body;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        message: "Conversation ID is required",
      });
    }

    // Find conversation
    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check if current user belongs to conversation
    const isMember = conversation.members.some(
      (member) => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this conversation",
      });
    }

    // Create message
    const message = await Message.create({
      conversationId,
      sender: req.user.id,
      text: text || "",
      image: image || "",
      delivered: false,
      seen: false,
    });

    // Update conversation timestamp
    conversation.updatedAt = Date.now();
    await conversation.save();

    // Populate sender
    const populatedMessage = await Message.findById(
      message._id
    ).populate("sender", "name profilePic");

    res.status(201).json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    console.error("Send Message Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================================
// Get Messages
// =======================================
exports.getMessages = async (req, res) => {
  try {
    const conversation = await Conversation.findById(
      req.params.id
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check membership
    const isMember = conversation.members.some(
      (member) => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "You are not a member of this conversation",
      });
    }

    const messages = await Message.find({
      conversationId: req.params.id,
    })
      .populate("sender", "name profilePic")
      .sort({ createdAt: 1 });

    res.status(200).json({
      success: true,
      messages,
    });
  } catch (err) {
    console.error("Get Messages Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================================
// Mark One Message as Delivered
// =======================================
exports.markDelivered = async (req, res) => {
  try {
    const message = await Message.findById(
      req.params.id
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const conversation = await Conversation.findById(
      message.conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check membership
    const isMember = conversation.members.some(
      (member) => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    message.delivered = true;

    await message.save();

    const populatedMessage = await Message.findById(
      message._id
    ).populate("sender", "name profilePic");

    res.status(200).json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    console.error("Mark Delivered Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================================
// Mark One Message as Seen
// =======================================
exports.markSeen = async (req, res) => {
  try {
    const message = await Message.findById(
      req.params.id
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    const conversation = await Conversation.findById(
      message.conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check membership
    const isMember = conversation.members.some(
      (member) => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    message.delivered = true;
    message.seen = true;

    await message.save();

    const populatedMessage = await Message.findById(
      message._id
    ).populate("sender", "name profilePic");

    res.status(200).json({
      success: true,
      message: populatedMessage,
    });
  } catch (err) {
    console.error("Mark Seen Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================================
// Mark Entire Conversation as Seen
// =======================================
exports.markConversationSeen = async (req, res) => {
  try {
    const conversationId = req.params.id;

    const conversation = await Conversation.findById(
      conversationId
    );

    if (!conversation) {
      return res.status(404).json({
        success: false,
        message: "Conversation not found",
      });
    }

    // Check membership
    const isMember = conversation.members.some(
      (member) => member.toString() === req.user.id
    );

    if (!isMember) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    // Mark only messages sent by the other user as seen
    await Message.updateMany(
      {
        conversationId,
        sender: { $ne: req.user.id },
        seen: false,
      },
      {
        $set: {
          delivered: true,
          seen: true,
        },
      }
    );

    res.status(200).json({
      success: true,
      message: "Conversation marked as seen",
    });
  } catch (err) {
    console.error(
      "Mark Conversation Seen Error:",
      err
    );

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// =======================================
// Delete Message
// =======================================
exports.deleteMessage = async (req, res) => {
  try {
    const message = await Message.findById(
      req.params.id
    );

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      });
    }

    // Only sender can delete
    if (message.sender.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Not authorized",
      });
    }

    await message.deleteOne();

    res.status(200).json({
      success: true,
      message: "Message deleted",
    });
  } catch (err) {
    console.error("Delete Message Error:", err);

    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};