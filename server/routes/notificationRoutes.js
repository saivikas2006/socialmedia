const express = require("express");
const router = express.Router();

const { protect } = require("../middleware/authMiddleware");

const {
  getNotifications,
  readNotification,
  readAllNotifications,
  deleteNotification,
} = require("../controllers/notificationController");

router.get("/", protect, getNotifications);

router.put("/read/:id", protect, readNotification);

router.put("/read-all", protect, readAllNotifications);

router.delete("/:id", protect, deleteNotification);

module.exports = router;