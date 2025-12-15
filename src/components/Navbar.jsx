// src/components/Navbar.jsx
import React, { useMemo, useState } from "react";
import { NavLink, useLocation, useNavigate } from "react-router-dom";
import "./Navbar.css";

import { clearAuth, getUser, isAuthed } from "../utils/authStore";
import { getTheme, setTheme } from "../utils/themeStore";

export default function Navbar() {
  const nav = useNavigate();
  const location = useLocation();

  const authed = isAuthed();
  const user = getUser();

  const [q, setQ] = useState("");
  const theme = useMemo(() => getTheme?.() || "light", []);

  // If user is already on /jobs?search=... keep input showing that keyword
  React.useEffect(() => {
    const onJobs = location.pathname.startsWith("/jobs");
    if (!onJobs) return;
    const sp = new URLSearchParams(location.search);
    setQ(sp.get("search") || "");
  }, [location.pathname, location.search]);

  if (!authed) return null;

  const role = user?.role || "user";
  const displayName = user?.name || (user?.email ? user.email.split("@")[0] : "User");

  const goSearch = (e) => {
    e.preventDefault();
    const next = q.trim();
    nav(`/jobs?search=${encodeURIComponent(next)}&page=1`);
  };

  const onLogout = () => {
    clearAuth();
    nav("/login");
  };

  const toggleTheme = () => {
    const current = (getTheme?.() || "light").toLowerCase();
    const next = current === "dark" ? "light" : "dark";
    setTheme(next);
    window.location.reload(); // simple + consistent with your current setup
  };

  const dashboardPath = role === "company" ? "/company" : "/dashboard";

  return (
    <div className="navWrap">
      <div className="navInner">
        <div className="brand" onClick={() => nav(dashboardPath)} role="button" tabIndex={0}>
          <span className="dot" />
          <span className="brandText">JobHunt</span>
        </div>

        <form className="navSearch" onSubmit={goSearch}>
          <span className="searchIcon" aria-hidden="true">⌕</span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search jobs, companies..."
            aria-label="Search jobs"
          />
          <button className="searchBtn" type="submit">Search</button>
        </form>

        <div className="navLinks">
          <button className="pill soft" onClick={toggleTheme} type="button">
            {String(getTheme?.() || "light").toLowerCase() === "dark" ? "Light" : "Dark"}
          </button>

          <NavLink className={({ isActive }) => `pill ${isActive ? "active" : ""}`} to={dashboardPath}>
            Dashboard
          </NavLink>
          <NavLink className={({ isActive }) => `pill ${isActive ? "active" : ""}`} to="/jobs">
            Jobs
          </NavLink>
          <NavLink className={({ isActive }) => `pill ${isActive ? "active" : ""}`} to="/saved">
            Saved
          </NavLink>
          <NavLink className={({ isActive }) => `pill ${isActive ? "active" : ""}`} to="/profile">
            Profile
          </NavLink>

          <button className="pill danger" onClick={onLogout} type="button">
            Logout
          </button>

          <div className="userChip">
            <div className="avatar">{displayName.slice(0, 2).toUpperCase()}</div>
            <div className="userMeta">
              <div className="userName">{displayName}</div>
              <div className="userRole">{role}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
