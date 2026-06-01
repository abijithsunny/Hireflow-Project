const multer = require("multer");
const path = require("path");
const fs = require("fs");

// Ensure uploads directory exists
const uploadDir = path.join(__dirname, "../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const resumeDir = path.join(uploadDir, "resumes");
const photoDir  = path.join(uploadDir, "photos");
if (!fs.existsSync(resumeDir)) fs.mkdirSync(resumeDir);
if (!fs.existsSync(photoDir))  fs.mkdirSync(photoDir);

// Storage config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    if (file.fieldname === "resume") cb(null, resumeDir);
    else cb(null, photoDir);
  },
  filename: (req, file, cb) => {
    const unique = `${req.user._id}_${Date.now()}${path.extname(file.originalname)}`;
    cb(null, unique);
  },
});

// File filter
const fileFilter = (req, file, cb) => {
  if (file.fieldname === "resume") {
    if (file.mimetype === "application/pdf") cb(null, true);
    else cb(new Error("Only PDF files are allowed for resume"), false);
  } else if (file.fieldname === "profilePhoto") {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed for profile photo"), false);
  } else {
    cb(null, true);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

module.exports = upload;
