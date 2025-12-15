// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { signup } from "../api/auth";
import { setAuth } from "../utils/authStore";
import "./Auth.css";

export default function Signup() {
  const nav = useNavigate();

  const [role, setRole] = useState("user"); // user | company
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState("");

  const onSubmit = async (e) => {
    e.preventDefault();
    try {
      setLoading(true);
      setErr("");
      const res = await signup({ name, email, password, role });
      setAuth(res.token, res.user);

      if (res.user?.role === "company") return nav("/company", { replace: true });
      return nav("/dashboard", { replace: true });
    } catch (e2) {
      setErr(e2.message || "Signup failed");
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

        <h1 className="authTitle">Create your account</h1>
        <p className="authSub">Choose a role and start using the platform.</p>

        {err && <div className="authAlert">{err}</div>}

        <form onSubmit={onSubmit} className="authForm">
          <label>
            Account type
            <select value={role} onChange={(e) => setRole(e.target.value)}>
              <option value="user">Applicant</option>
              <option value="company">Company</option>
            </select>
          </label>

          <label>
            Name
            <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Your name" />
          </label>

          <label>
            Email
            <input value={email} onChange={(e) => setEmail(e.target.value)} type="email" required />
          </label>

          <label>
            Password (min 6)
            <input value={password} onChange={(e) => setPassword(e.target.value)} type="password" required minLength={6} />
          </label>

          <button disabled={loading} className="authBtn" type="submit">
            {loading ? "Creating..." : "Create account"}
          </button>
        </form>

        <div className="authFoot">
          <span>Already have an account?</span> <Link to="/login">Log in</Link>
        </div>
      </div>
    </div>
  );
}
