const express = require("express");
const router  = express.Router();
const {
  getJobs, getJobById, createJob, updateJob, deleteJob, getMyJobs,
} = require("../controllers/jobController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.get("/",                getJobs);
router.get("/recruiter/myjobs", protect, authorize("recruiter"), getMyJobs);
router.get("/:id",             getJobById);
router.post("/",               protect, authorize("recruiter", "admin"), createJob);
router.put("/:id",             protect, authorize("recruiter", "admin"), updateJob);
router.delete("/:id",          protect, authorize("recruiter", "admin"), deleteJob);

module.exports = router;
