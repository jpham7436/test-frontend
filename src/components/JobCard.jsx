import React from "react";

export default function JobCard({ job }) {
  return (
    <div className="card">
      <h3 className="card__title">{job.title || "Untitled Role"}</h3>
      <div className="card__meta">
        <span>{job.company || "Unknown Company"}</span>
        {job.location ? <span> • {job.location}</span> : null}
      </div>

      <div className="card__sub">
        {job.type ? <span className="pill">{job.type}</span> : null}
        {job.salary ? <span className="pill">{job.salary}</span> : null}
      </div>
    </div>
  );
}
