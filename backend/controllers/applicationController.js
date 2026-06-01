const Application = require("../models/Application");
const Job = require("../models/Job");

// @route  POST /api/applications/apply/:jobId
// @access Private (candidate)
const applyJob = async (req, res) => {
  try {
    const { coverNote } = req.body;
    const { jobId } = req.params;

    // Check job exists
    const job = await Job.findById(jobId);
    if (!job || !job.isActive)
      return res.status(404).json({ message: "Job not found" });

    // Prevent duplicate application
    const already = await Application.findOne({ candidateId: req.user._id, jobId });
    if (already)
      return res.status(409).json({ message: "You have already applied for this job" });

    const application = await Application.create({
      candidateId: req.user._id,
      jobId,
      coverNote: coverNote || "",
    });

    await application.populate([
      { path: "jobId",       select: "title company location salary" },
      { path: "candidateId", select: "name email skills" },
    ]);

    res.status(201).json({ message: "Application submitted successfully", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/applications/my
// @access Private (candidate)
const getMyApplications = async (req, res) => {
  try {
    const applications = await Application.find({ candidateId: req.user._id })
      .populate("jobId", "title company location salary requirements jobType")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/applications/job/:jobId
// @access Private (recruiter who owns job / admin)
const getJobApplications = async (req, res) => {
  try {
    const job = await Job.findById(req.params.jobId);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (req.user.role !== "admin" && job.recruiterId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized" });

    const applications = await Application.find({ jobId: req.params.jobId })
      .populate("candidateId", "name email skills resume location bio")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/applications/:id/status
// @access Private (recruiter / admin)
const updateStatus = async (req, res) => {
  try {
    const { status, recruiterNote } = req.body;
    const validStatuses = ["pending", "reviewed", "accepted", "rejected"];

    if (!validStatuses.includes(status))
      return res.status(400).json({ message: "Invalid status value" });

    const application = await Application.findById(req.params.id).populate("jobId");
    if (!application) return res.status(404).json({ message: "Application not found" });

    // Recruiter can only update their own job applications
    if (
      req.user.role !== "admin" &&
      application.jobId.recruiterId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({ message: "Not authorized" });
    }

    application.status       = status;
    application.recruiterNote = recruiterNote || application.recruiterNote;
    await application.save();

    res.json({ message: "Application status updated", application });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/applications/all
// @access Private (admin)
const getAllApplications = async (req, res) => {
  try {
    const applications = await Application.find()
      .populate("candidateId", "name email")
      .populate("jobId", "title company")
      .sort({ createdAt: -1 });

    res.json({ applications });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { applyJob, getMyApplications, getJobApplications, updateStatus, getAllApplications };
