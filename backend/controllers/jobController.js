const Job = require("../models/Job");
const Application = require("../models/Application");

// @route  GET /api/jobs
// @access Public
const getJobs = async (req, res) => {
  try {
    const { search, location, jobType, experience, page = 1, limit = 10 } = req.query;

    const query = { isActive: true };

    if (search) {
      query.$or = [
        { title:       { $regex: search, $options: "i" } },
        { company:     { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { requirements: { $in: [new RegExp(search, "i")] } },
      ];
    }
    if (location)   query.location = { $regex: location, $options: "i" };
    if (jobType)    query.jobType = jobType;
    if (experience) query.experience = experience;

    const total = await Job.countDocuments(query);
    const jobs  = await Job.find(query)
      .populate("recruiterId", "name company email")
      .populate("applicantCount")
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(Number(limit));

    res.json({ jobs, total, page: Number(page), pages: Math.ceil(total / limit) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/jobs/:id
// @access Public
const getJobById = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate("recruiterId", "name company email")
      .populate("applicantCount");

    if (!job || !job.isActive)
      return res.status(404).json({ message: "Job not found" });

    res.json({ job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  POST /api/jobs
// @access Private (recruiter/admin)
const createJob = async (req, res) => {
  try {
    const { title, company, location, salary, description, requirements, jobType, experience } = req.body;

    if (!title || !company || !location || !salary || !description)
      return res.status(400).json({ message: "Please fill all required fields" });

    const job = await Job.create({
      title,
      company,
      location,
      salary,
      description,
      requirements: Array.isArray(requirements)
        ? requirements
        : (requirements || "").split(",").map((r) => r.trim()).filter(Boolean),
      jobType:    jobType    || "full-time",
      experience: experience || "fresher",
      recruiterId: req.user._id,
    });

    res.status(201).json({ message: "Job posted successfully", job });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  PUT /api/jobs/:id
// @access Private (recruiter who owns it / admin)
const updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (req.user.role !== "admin" && job.recruiterId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to update this job" });

    const updated = await Job.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    res.json({ message: "Job updated", job: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  DELETE /api/jobs/:id
// @access Private (recruiter who owns it / admin)
const deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);
    if (!job) return res.status(404).json({ message: "Job not found" });

    if (req.user.role !== "admin" && job.recruiterId.toString() !== req.user._id.toString())
      return res.status(403).json({ message: "Not authorized to delete this job" });

    await Job.findByIdAndDelete(req.params.id);
    await Application.deleteMany({ jobId: req.params.id });

    res.json({ message: "Job deleted successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// @route  GET /api/jobs/recruiter/myjobs
// @access Private (recruiter)
const getMyJobs = async (req, res) => {
  try {
    const jobs = await Job.find({ recruiterId: req.user._id })
      .populate("applicantCount")
      .sort({ createdAt: -1 });
    res.json({ jobs });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

module.exports = { getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs };
