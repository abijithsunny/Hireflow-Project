import { useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { jobsAPI } from "../../services/api";
import { Input, Textarea, Select, Btn } from "../../components/UI";

export default function PostJob() {
  const { user, showToast } = useAuth();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    title: "", company: user?.company || "", location: "", salary: "",
    description: "", requirements: "", jobType: "full-time", experience: "fresher",
  });

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    if (!form.title || !form.company || !form.location || !form.salary || !form.description) {
      showToast("Please fill all required fields.", "error"); return;
    }
    setLoading(true);
    try {
      await jobsAPI.create({
        ...form,
        requirements: form.requirements.split(",").map((r) => r.trim()).filter(Boolean),
      });
      showToast("Job posted successfully! 🎉");
      setForm({ title: "", company: user?.company || "", location: "", salary: "",
        description: "", requirements: "", jobType: "full-time", experience: "fresher" });
    } catch (err) {
      showToast(err.response?.data?.message || "Failed to post job.", "error");
    } finally { setLoading(false); }
  };

  return (
    <div className="p-7 max-w-2xl">
      <h1 className="page-title mb-6">Post a New Job</h1>
      <div className="card p-7">
        <form onSubmit={handle}>
          <Input label="Job Title *"  placeholder="e.g. Frontend Developer" value={form.title}   onChange={set("title")} />
          <Input label="Company *"    placeholder="Company name"             value={form.company} onChange={set("company")} />
          <div className="grid grid-cols-2 gap-4">
            <Input label="Location *"     placeholder="e.g. Bangalore" value={form.location} onChange={set("location")} />
            <Input label="Salary Range *" placeholder="e.g. 8-12 LPA"  value={form.salary}   onChange={set("salary")} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <Select label="Job Type" value={form.jobType} onChange={set("jobType")}>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="remote">Remote</option>
              <option value="contract">Contract</option>
              <option value="internship">Internship</option>
            </Select>
            <Select label="Experience Level" value={form.experience} onChange={set("experience")}>
              <option value="fresher">Fresher</option>
              <option value="1-3 years">1–3 years</option>
              <option value="3-5 years">3–5 years</option>
              <option value="5+ years">5+ years</option>
            </Select>
          </div>
          <Textarea label="Job Description *"
            placeholder="Describe the role, responsibilities, and what you're looking for…"
            className="min-h-[120px]" value={form.description} onChange={set("description")} />
          <Input label="Requirements (comma-separated)" placeholder="React, Node.js, MongoDB"
            value={form.requirements} onChange={set("requirements")} />
          <Btn type="submit" disabled={loading} className="mt-1">
            {loading ? "Posting…" : "Post Job →"}
          </Btn>
        </form>
      </div>
    </div>
  );
}
