import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./Navbar.css";

function Navbar() {
  const [searchQuery, setSearchQuery] = useState("");
  const navigate = useNavigate();

  // Theme: load saved or default light
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem("theme") || "light";
  });

  // Apply theme to <html data-theme="...">
  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((t) => (t === "light" ? "dark" : "light"));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/jobs?search=${encodeURIComponent(searchQuery)}`);
      setSearchQuery("");
    }
  };

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/" className="navbar-logo">
          JobHunting
        </Link>

        <form className="navbar-search" onSubmit={handleSearch}>
          <input
            type="text"
            placeholder="Search jobs, companies, locations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </form>

        <div className="navbar-links">
          <Link to="/" className="navbar-link">Home</Link>
          <Link to="/jobs" className="navbar-link">Jobs</Link>
          <Link to="/saved" className="navbar-link">Saved</Link>

          {/* NEW: Post a Job */}
          <Link to="/post" className="navbar-link navbar-link--post">
            Post a Job
          </Link>

          {/* Theme Toggle */}
          <button
            type="button"
            className="theme-toggle"
            onClick={toggleTheme}
          >
            {theme === "light" ? "Dark" : "Light"}
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;
