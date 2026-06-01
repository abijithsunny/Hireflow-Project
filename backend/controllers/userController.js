const User = require("../models/User");
const Application = require("../models/Application");
const Job = require("../models/Job");
const fs = require("fs");
const path = require("path");

// @route  GET /api/users/profile
// @access Private
const getProfile = async (req, res) => {
  res.json({ user: req.user });
};

// @route  PUT /api/users/profile
// @access Private
const updateProfile = async (req, res) => {
  try {
    const { name, bio, location, skills, company, companyWebsite } = req.body;

    const user = await User.findById(req.user._id);

    if (name)           user.name           = name;
    if (bio !== undefined)   user.bio       = bio;
    if (location !== undefined) user.location = location;
    if (company !== undefined)  user.company = company;
    if (companyWebsite !== undefined) user.companyWebsite = companyWebsite;

    if (skills) {
      user.skills = Array.isArray(skills)
        ? skills
        : skills.split(",").map((s) => s.trim()).filter(Boolean);
    }

    await user.save();
    res.json({ message: "Profile updated", user });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/users/upload-resume
// @access Private (candidate)
const uploadResume = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);

    // Delete old resume file
    if (user.resume) {
      const old = path.join(__dirname, "../", user.resume);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    user.resume = `uploads/resumes/${req.file.filename}`;
    await user.save();

    res.json({ message: "Resume uploaded", resume: user.resume });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/users/upload-photo
// @access Private
const uploadPhoto = async (req, res) => {
  try {
    if (!req.file)
      return res.status(400).json({ message: "No file uploaded" });

    const user = await User.findById(req.user._id);

    if (user.profilePhoto) {
      const old = path.join(__dirname, "../", user.profilePhoto);
      if (fs.existsSync(old)) fs.unlinkSync(old);
    }

    user.profilePhoto = `uploads/photos/${req.file.filename}`;
    await user.save();

    res.json({ message: "Photo uploaded", profilePhoto: user.profilePhoto });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ─── Admin Routes ─────────────────────────────────────────────────────────────

// @route  GET /api/users/all
// @access Private (admin)
const getAllUsers = async (req, res) => {
  try {
    const { role } = req.query;
    const query = role ? { role } : {};
    const users = await User.find(query).sort({ createdAt: -1 });
    res.json({ users });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/users/:id
// @access Private (admin)
const deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.role === "admin") return res.status(403).json({ message: "Cannot delete admin" });

    await User.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ candidateId: req.params.id });
    await Job.deleteMany({ recruiterId: req.params.id });

    res.json({ message: "User deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/users/analytics
// @access Private (admin)
const getAnalytics = async (req, res) => {
  try {
    const [
      totalUsers,
      candidates,
      recruiters,
      totalJobs,
      totalApplications,
      accepted,
      rejected,
      pending,
    ] = await Promise.all([
      User.countDocuments(),
      User.countDocuments({ role: "candidate" }),
      User.countDocuments({ role: "recruiter" }),
      Job.countDocuments({ isActive: true }),
      Application.countDocuments(),
      Application.countDocuments({ status: "accepted" }),
      Application.countDocuments({ status: "rejected" }),
      Application.countDocuments({ status: "pending" }),
    ]);

    // Jobs by location
    const jobsByLocation = await Job.aggregate([
      { $group: { _id: "$location", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 8 },
    ]);

    // Applications per day (last 7 days)
    const last7 = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
    const appsByDay = await Application.aggregate([
      { $match: { createdAt: { $gte: last7 } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json({
      totalUsers, candidates, recruiters,
      totalJobs, totalApplications,
      accepted, rejected, pending,
      jobsByLocation,
      appsByDay,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = {
  getProfile, updateProfile, uploadResume, uploadPhoto,
  getAllUsers, deleteUser, getAnalytics,
};
