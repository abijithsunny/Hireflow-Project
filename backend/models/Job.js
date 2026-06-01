const mongoose = require("mongoose");

const jobSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Job title is required"],
      trim: true,
    },
    company: {
      type: String,
      required: [true, "Company name is required"],
      trim: true,
    },
    location: {
      type: String,
      required: [true, "Location is required"],
    },
    salary: {
      type: String,
      required: [true, "Salary range is required"],
    },
    description: {
      type: String,
      required: [true, "Job description is required"],
    },
    requirements: [{ type: String }],
    jobType: {
      type: String,
      enum: ["full-time", "part-time", "contract", "internship", "remote"],
      default: "full-time",
    },
    experience: {
      type: String,
      enum: ["fresher", "1-3 years", "3-5 years", "5+ years"],
      default: "fresher",
    },
    recruiterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Virtual: applicant count
jobSchema.virtual("applicantCount", {
  ref: "Application",
  localField: "_id",
  foreignField: "jobId",
  count: true,
});

jobSchema.set("toJSON", { virtuals: true });
jobSchema.set("toObject", { virtuals: true });

module.exports = mongoose.model("Job", jobSchema);
