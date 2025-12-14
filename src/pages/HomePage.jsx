import React from "react";
import { Link } from "react-router-dom";

export default function HomePage() {
  return (
    <div className="container">
      <h1 className="pageTitle">Frontend</h1>
      <p className="muted">
        This UI pulls job listings from the backend API and lets users filter results.
      </p>

      <div style={{ marginTop: 16 }}>
        <Link to="/jobs" className="btn">
          View Jobs
        </Link>
      </div>
    </div>
  );
}
