import { Btn } from "./UI";

const SKILL_COLORS = [
  "bg-violet-50 text-violet-700",
  "bg-blue-50   text-blue-700",
  "bg-green-50  text-green-700",
  "bg-amber-50  text-amber-700",
  "bg-pink-50   text-pink-700",
];

const fmt = (d) =>
  new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function JobCard({ job, onView, onApply, applied, recruiterMode, onDelete }) {
  const count = job.applicantCount ?? job.applicants ?? 0;

  return (
    <div className="card p-5 hover:shadow-md hover:border-indigo-200 transition-all duration-200">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-base font-bold text-gray-900 mb-0.5">{job.title}</h3>
          <p className="text-sm font-semibold text-indigo-600">{job.company}</p>
        </div>
        <div className="text-right">
          <p className="text-xs text-gray-400">{fmt(job.createdAt || job.posted)}</p>
          <span className="inline-block mt-1 text-xs font-semibold bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md capitalize">
            {job.jobType || "full-time"}
          </span>
        </div>
      </div>

      {/* Meta */}
      <div className="flex flex-wrap gap-4 text-xs text-gray-500 mb-3">
        <span>📍 {job.location}</span>
        <span>💰 {job.salary}</span>
        <span>👥 {count} applicants</span>
        <span>🎓 {job.experience || "fresher"}</span>
      </div>

      {/* Description */}
      <p className="text-sm text-gray-500 leading-relaxed mb-3 line-clamp-2">{job.description}</p>

      {/* Skills */}
      <div className="flex flex-wrap gap-1.5 mb-4">
        {(job.requirements || []).map((r, i) => (
          <span key={r} className={`text-xs font-semibold px-2.5 py-1 rounded-md ${SKILL_COLORS[i % SKILL_COLORS.length]}`}>
            {r}
          </span>
        ))}
      </div>

      {/* Actions */}
      <div className="flex gap-2 flex-wrap">
        <Btn small variant="outline" onClick={() => onView?.(job)}>View Details</Btn>

        {!recruiterMode && (
          applied
            ? <Btn small variant="success" disabled>✓ Applied</Btn>
            : <Btn small onClick={() => onApply?.(job)}>Apply Now</Btn>
        )}

        {recruiterMode && (
          <>
            <Btn small variant="secondary" onClick={() => onView?.(job, "applicants")}>
              Applicants ({count})
            </Btn>
            <Btn small variant="danger" onClick={() => onDelete?.(job._id || job.id)}>
              Delete
            </Btn>
          </>
        )}
      </div>
    </div>
  );
}
