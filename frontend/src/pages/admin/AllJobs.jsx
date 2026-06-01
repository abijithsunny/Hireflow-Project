import { useState, useEffect } from "react";
import { useAuth } from "../../context/AuthContext";
import { jobsAPI } from "../../services/api";
import { Btn, Spinner } from "../../components/UI";

const fmt = (d) => new Date(d).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" });

export default function AllJobs() {
  const { showToast }         = useAuth();
  const [jobs, setJobs]       = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState("");

  useEffect(() => {
    jobsAPI.getAll({ limit: 200 }).then((r) => setJobs(r.data.jobs)).finally(() => setLoading(false));
  }, []);

  const handleDelete = async (id) => {
    if (!window.confirm("Remove this job and all applications?")) return;
    try {
      await jobsAPI.delete(id);
      setJobs((p) => p.filter((j) => j._id !== id));
      showToast("Job removed.");
    } catch (err) {
      showToast(err.response?.data?.message || "Failed.", "error");
    }
  };

  const filtered = jobs.filter((j) =>
    !search || j.title.toLowerCase().includes(search.toLowerCase()) || j.company.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-7">
      <div className="flex justify-between items-center mb-6 gap-3">
        <h1 className="page-title">All Jobs</h1>
        <input placeholder="🔍 Title or company…" value={search} onChange={(e) => setSearch(e.target.value)}
          className="form-input w-64" />
      </div>

      {loading ? <Spinner /> : (
        <div className="card overflow-hidden">
          <table className="w-full border-collapse text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                {["Title", "Company", "Location", "Type", "Applicants", "Posted By", "Date", "Action"].map((h) => (
                  <th key={h} className="table-th">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((j) => (
                <tr key={j._id} className="table-row">
                  <td className="table-td font-semibold text-gray-900">{j.title}</td>
                  <td className="table-td font-semibold text-indigo-600">{j.company}</td>
                  <td className="table-td text-gray-400">{j.location}</td>
                  <td className="table-td">
                    <span className="bg-gray-100 text-gray-600 text-xs font-semibold px-2 py-0.5 rounded capitalize">
                      {j.jobType}
                    </span>
                  </td>
                  <td className="table-td">
                    <span className="bg-violet-50 text-violet-700 text-xs font-bold px-2.5 py-1 rounded-full">
                      {j.applicantCount || 0}
                    </span>
                  </td>
                  <td className="table-td text-gray-400">{j.recruiterId?.name || "—"}</td>
                  <td className="table-td text-gray-300 text-xs">{fmt(j.createdAt)}</td>
                  <td className="table-td">
                    <Btn small variant="danger" onClick={() => handleDelete(j._id)}>Remove</Btn>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && (
            <p className="text-center py-10 text-sm text-gray-400">No jobs found.</p>
          )}
        </div>
      )}
    </div>
  );
}
