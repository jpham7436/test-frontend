import React from "react";

function timeAgo(dateValue) {
  if (!dateValue) return "";
  const d = new Date(dateValue);
  if (Number.isNaN(d.getTime())) return "";
  const diffMs = Date.now() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}

export default function JobCard({ job, selected, onSelect, isSaved, onToggleSave }) {
  const id = job.id || job._id || job.job_id;

  const title = job.title || "Untitled Role";
  const company = job.company || "Unknown Company";
  const location = job.location || "Location not listed";
  const type = job.type || "";
  const salary = job.salary || "";
  const posted = job.posted_at || job.postedAt || job.created_at || job.createdAt;
  const postedLabel = timeAgo(posted);

  const easyApply =
    job.easyApply === true ||
    String(job.easy_apply || "").toLowerCase() === "true" ||
    String(job.apply_type || "").toLowerCase().includes("easy");

  const certified = String(job.verdict || "").toLowerCase() === "certified";
  const score = job.verification_score ?? job.score ?? null;

  const onStarClick = (e) => {
    e.stopPropagation();
    onToggleSave?.(id);
  };

  return (
    <button
      type="button"
      className={`job-card ${selected ? "job-card--selected" : ""}`}
      onClick={() => onSelect?.(id)}
    >
      <div className="job-card__row">
        <div className="job-card__logo" aria-hidden="true">
          {company?.[0]?.toUpperCase() || "J"}
        </div>

        <div className="job-card__body">
          <div className="job-card__top">
            <h3 className="job-card__title">{title}</h3>

            <div className="job-card__actions">
              <button
                type="button"
                className={`job-card__saveBtn ${isSaved ? "job-card__saveBtn--saved" : ""}`}
                onClick={onStarClick}
                aria-label={isSaved ? "Unsave job" : "Save job"}
                title={isSaved ? "Saved" : "Save"}
              >
                {isSaved ? "★" : "☆"}
              </button>
            </div>
          </div>

          <div className="job-card__meta">
            <span className="job-card__company">{company}</span>
            <span className="job-card__dot">•</span>
            <span>{location}</span>
          </div>

          <div className="job-card__meta2">{postedLabel ? <span>{postedLabel}</span> : <span>&nbsp;</span>}</div>

          <div className="job-card__pills">
            {type ? <span className="pill">{type}</span> : null}
            {salary ? <span className="pill pill--ghost">{salary}</span> : null}
            {easyApply ? <span className="pill pill--easy">Easy Apply</span> : null}
            {certified ? <span className="pill pill--cert">Certified</span> : null}
            {typeof score === "number" ? <span className="pill pill--score">Score: {score}</span> : null}
          </div>
        </div>
      </div>
    </button>
  );
}
