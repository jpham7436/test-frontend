// src/App.js
import React, { useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";

import Navbar from "./components/Navbar";

import RequireAuth from "./components/RequireAuth";
import RequireCompany from "./components/RequireCompany";

import Home from "./pages/HomePage";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Saved from "./pages/Saved";
import PostJob from "./pages/PostJob";
import Profile from "./pages/Profile";

import Login from "./pages/Login";
import Signup from "./pages/Signup";

import Dashboard from "./pages/Dashboard";
import CompanyDashboard from "./pages/CompanyDashboard";

import { getUser, isAuthed } from "./utils/authStore";
import { initTheme } from "./utils/themeStore";
import "./App.css";

function StartRedirect() {
  if (!isAuthed()) return <Navigate to="/login" replace />;
  const user = getUser();
  if (!user) return <Navigate to="/login" replace />;
  if (user.role === "company") return <Navigate to="/company" replace />;
  return <Navigate to="/dashboard" replace />;
}

function Shell({ children }) {
  const location = useLocation();
  const hideNav = location.pathname === "/login" || location.pathname === "/signup";

  return (
    <div className="App">
      {!hideNav && <Navbar />}
      {children}
    </div>
  );
}

export default function App() {
  useEffect(() => {
    initTheme();
  }, []);

  return (
    <Router>
      <Shell>
        <Routes>
          {/* Start */}
          <Route path="/" element={<StartRedirect />} />

          {/* Auth */}
          <Route path="/login" element={<Login />} />
          <Route path="/signup" element={<Signup />} />

          {/* Protected */}
          <Route
            path="/dashboard"
            element={
              <RequireAuth>
                <Dashboard />
              </RequireAuth>
            }
          />

          <Route
            path="/company"
            element={
              <RequireCompany>
                <CompanyDashboard />
              </RequireCompany>
            }
          />

          <Route
            path="/jobs"
            element={
              <RequireAuth>
                <Jobs />
              </RequireAuth>
            }
          />

          <Route
            path="/jobs/:id"
            element={
              <RequireAuth>
                <JobDetails />
              </RequireAuth>
            }
          />

          <Route
            path="/saved"
            element={
              <RequireAuth>
                <Saved />
              </RequireAuth>
            }
          />

          <Route
            path="/profile"
            element={
              <RequireAuth>
                <Profile />
              </RequireAuth>
            }
          />

          <Route
            path="/post"
            element={
              <RequireCompany>
                <PostJob />
              </RequireCompany>
            }
          />

          {/* Optional */}
          <Route path="/home" element={<Home />} />

          {/* Fallback */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Shell>
    </Router>
  );
}
