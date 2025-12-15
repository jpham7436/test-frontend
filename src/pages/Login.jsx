// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { login } from "../api/auth";
import { setAuth } from "../utils/authStore";
import "./Auth.css";

export default function Login() {
  const nav = useNavigate();
  const location = useLocation();
  const from = location.state?.from;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErr("");
      const res = await login({ email, password });
      setAuth(res.token, res.user);

      // route based on role OR return to where they tried to go
      if (from) return nav(from, { replace: true });
      if (res.user?.role === "company") return nav("/company", { replace: true });
      return nav("/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="authShell">
      <div className="authCard">
        <div className="authBrand">
          <span className="dot" />
          <span>JobHunt</span>
        </div>

        <h1 className="authTitle">Welcome back</h1>
        <p className="authSub">Log in to view jobs, save listings, and manage your profile.</p>

        {err && <div className="authAlert">{err}</div>}

        <form onSubmit={onSubmit} className="authForm">
          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>

          <label>
            Password
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required />
          </label>

          <button disabled={loading} className="authBtn" type="submit">
            {loading ? "Logging in..." : "Log in"}
          </button>
        </form>

        <div className="authFoot">
          <span>New here?</span> <Link to="/signup">Create an account</Link>
        </div>
      </div>
    </div>
  );
}
