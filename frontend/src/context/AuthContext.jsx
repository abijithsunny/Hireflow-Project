import { createContext, useContext, useState, useEffect } from "react";
import { authAPI } from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user,    setUser]    = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast,   setToast]   = useState(null);

  // Restore session from localStorage token
  useEffect(() => {
    const token = localStorage.getItem("hireflow_token");
    if (token) {
      authAPI.getMe()
        .then((r) => setUser(r.data.user))
        .catch(()  => localStorage.removeItem("hireflow_token"))
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  const showToast = (msg, type = "success") => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  };

  const login = async (email, password) => {
    const res = await authAPI.login({ email, password });
    localStorage.setItem("hireflow_token", res.data.token);
    setUser(res.data.user);
    showToast(`Welcome back, ${res.data.user.name.split(" ")[0]}! 👋`);
    return res.data.user;
  };

  const register = async (formData) => {
    const res = await authAPI.register(formData);
    localStorage.setItem("hireflow_token", res.data.token);
    setUser(res.data.user);
    showToast("Account created! Welcome to HireFlow 🎉");
    return res.data.user;
  };

  const logout = () => {
    localStorage.removeItem("hireflow_token");
    setUser(null);
    showToast("Signed out successfully");
  };

  const updateUser = (data) =>
    setUser((prev) => ({ ...prev, ...data }));

  return (
    <AuthContext.Provider value={{ user, loading, toast, showToast, login, register, logout, updateUser }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be inside AuthProvider");
  return ctx;
}
