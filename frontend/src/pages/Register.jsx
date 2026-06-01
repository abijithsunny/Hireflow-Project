import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input, Select, Btn } from "../components/UI";

export default function Register() {
  const { register } = useAuth();
  const navigate     = useNavigate();
  const [form, setForm]       = useState({ name: "", email: "", password: "", role: "candidate", skills: "", company: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.password) { setError("Please fill all required fields."); return; }
    if (form.password.length < 6) { setError("Password must be at least 6 characters."); return; }
    try {
      setLoading(true); setError("");
      await register(form);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-2xl font-extrabold text-gray-900">Create Account</h1>
          <p className="text-gray-500 mt-1 text-sm">Join HireFlow today</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handle} className="space-y-1">
          <Input label="Full Name *"  placeholder="Your full name"      value={form.name}     onChange={set("name")} />
          <Input label="Email *"      type="email" placeholder="you@email.com" value={form.email} onChange={set("email")} />
          <Input label="Password *"   type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} />
          <Select label="I am a *"    value={form.role} onChange={set("role")}>
            <option value="candidate">Job Seeker (Candidate)</option>
            <option value="recruiter">Employer (Recruiter)</option>
          </Select>

          {form.role === "candidate" && (
            <Input label="Skills (comma-separated)" placeholder="React, Node.js, Python"
              value={form.skills} onChange={set("skills")} />
          )}
          {form.role === "recruiter" && (
            <Input label="Company Name" placeholder="Your company"
              value={form.company} onChange={set("company")} />
          )}

          <Btn type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Creating account…" : "Create Account →"}
          </Btn>
        </form>

        <p className="text-center mt-5 text-sm text-gray-500">
          Have an account?{" "}
          <Link to="/login" className="text-indigo-600 font-semibold hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
