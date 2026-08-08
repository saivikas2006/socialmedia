const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    // ================= Conversation =================
    conversationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Conversation",
      required: true,
    },

    // ================= Sender =================
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // ================= Message Text =================
    text: {
      type: String,
      default: "",
      trim: true,
    },

    // ================= Message Image =================
    image: {
      type: String,
      default: "",
    },

    // ================= Delivered =================
    delivered: {
      type: Boolean,
      default: false,
    },

    // ================= Seen =================
    seen: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Message", messageSchema);