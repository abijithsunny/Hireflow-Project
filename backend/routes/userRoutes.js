const express  = require("express");
const router   = express.Router();
const {
  getProfile, updateProfile, uploadResume, uploadPhoto,
  getAllUsers, deleteUser, getAnalytics,
} = require("../controllers/userController");
const { protect, authorize } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");

// Profile
router.get("/profile",        protect, getProfile);
router.put("/profile",        protect, updateProfile);
router.put("/upload-resume",  protect, authorize("candidate"), upload.single("resume"),      uploadResume);
router.put("/upload-photo",   protect, upload.single("profilePhoto"), uploadPhoto);

// Admin
router.get("/all",            protect, authorize("admin"), getAllUsers);
router.delete("/:id",         protect, authorize("admin"), deleteUser);
router.get("/analytics",      protect, authorize("admin"), getAnalytics);

module.exports = router;
