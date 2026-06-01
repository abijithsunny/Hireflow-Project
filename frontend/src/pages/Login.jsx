import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Input, Btn } from "../components/UI";

export default function Login() {
  const { login }   = useAuth();
  const navigate    = useNavigate();
  const [form, setForm]       = useState({ email: "", password: "" });
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const handle = async (e) => {
    e.preventDefault();
    if (!form.email || !form.password) { setError("Please fill all fields."); return; }
    try {
      setLoading(true); setError("");
      await login(form.email, form.password);
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.message || "Invalid credentials.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-violet-50 flex items-center justify-center p-5">
      <div className="bg-white rounded-3xl shadow-xl p-10 w-full max-w-md">
        {/* Brand */}
        <div className="text-center mb-8">
          <div className="text-5xl mb-3">🚀</div>
          <h1 className="text-3xl font-extrabold text-gray-900">HireFlow</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to your account</p>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-4 py-3 mb-5 text-sm font-medium">
            {error}
          </div>
        )}

        <form onSubmit={handle} className="space-y-1">
          <Input label="Email" type="email" placeholder="you@email.com"
            value={form.email} onChange={set("email")} />
          <Input label="Password" type="password" placeholder="Your password"
            value={form.password} onChange={set("password")} />

          <Btn type="submit" disabled={loading} className="w-full mt-2">
            {loading ? "Signing in…" : "Sign In →"}
          </Btn>
        </form>

        {/* Demo hint */}
        <div className="mt-5 bg-gray-50 rounded-xl p-4 text-xs text-gray-500 leading-relaxed">
          <p className="font-semibold text-gray-700 mb-1">Demo accounts</p>
          <p>Candidate → candidate@demo.com / demo123</p>
          <p>Recruiter → recruiter@demo.com / demo123</p>
          <p>Admin &nbsp;&nbsp;&nbsp;→ admin@demo.com &nbsp;/ admin123</p>
        </div>

        <p className="text-center mt-5 text-sm text-gray-500">
          No account?{" "}
          <Link to="/register" className="text-indigo-600 font-semibold hover:underline">
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
