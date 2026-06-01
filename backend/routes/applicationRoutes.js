const express = require("express");
const router  = express.Router();
const {
  applyJob, getMyApplications, getJobApplications, updateStatus, getAllApplications,
} = require("../controllers/applicationController");
const { protect, authorize } = require("../middleware/authMiddleware");

router.post("/apply/:jobId",    protect, authorize("candidate"), applyJob);
router.get("/my",               protect, authorize("candidate"), getMyApplications);
router.get("/job/:jobId",       protect, authorize("recruiter", "admin"), getJobApplications);
router.put("/:id/status",       protect, authorize("recruiter", "admin"), updateStatus);
router.get("/all",              protect, authorize("admin"), getAllApplications);

module.exports = router;
