const express = require("express");
const router = express.Router();

const {
  register,
  login,
} = require("../controllers/authController");

router.post("/register", register);
router.post("/login", login);

// Test Route
router.get("/register", (req, res) => {
  res.send("Register API is working");
});

module.exports = router;