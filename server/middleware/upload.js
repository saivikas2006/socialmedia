const multer = require("multer");

// Use memory storage instead of disk
const storage = multer.memoryStorage();

// File filter (keep same)
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image")) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
});

module.exports = upload;