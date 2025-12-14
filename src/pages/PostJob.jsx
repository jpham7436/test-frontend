import React, { useState } from "react";
import "./PostJob.css";

function PostJob() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [form, setForm] = useState({
    title: "",
    company: "",
    location: "",
    type: "Full-time",
    salary: "",
    availability: "",
    sources: "",
    sourceNames: "",
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const update = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const submit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess(false);

    if (!form.title || !form.company || !form.location || !form.salary) {
      setError("Please fill all required fields.");
      return;
    }

    setSubmitting(true);

    try {
      const source_urls = form.sources
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((u) => (u.startsWith("http") ? u : "https://" + u));

      const source_names = form.sourceNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const res = await fetch(`${API}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: form.title,
          company: form.company,
          location: form.location,
          type: form.type,
          salary: form.salary,
          availability: form.availability,
          source_urls,
          source_names,
        }),
      });

      if (!res.ok) throw new Error();

      setSuccess(true);
      setForm({
        title: "",
        company: "",
        location: "",
        type: "Full-time",
        salary: "",
        availability: "",
        sources: "",
        sourceNames: "",
      });
    } catch {
      setError("Failed to post job.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="postjob-page">
      <div className="postjob-shell">
        <header className="postjob-header">
          <div>
            <h1 className="postjob-title">Post a job</h1>
            <p className="postjob-subtitle">
              Create a new listing that appears immediately in the Jobs feed.
            </p>
          </div>

          <div className="postjob-badge" aria-hidden="true">
            Employer
          </div>
        </header>

        <form className="postjob-card" onSubmit={submit}>
          {/* JOB INFO */}
          <div className="postjob-section">
            <div className="postjob-sectionTitle">Job information</div>

            <div className="postjob-grid">
              <div className="field">
                <label>Job title <span className="req">*</span></label>
                <input
                  placeholder="e.g., Frontend Engineer"
                  value={form.title}
                  onChange={update("title")}
                />
              </div>

              <div className="field">
                <label>Company <span className="req">*</span></label>
                <input
                  placeholder="e.g., Stripe"
                  value={form.company}
                  onChange={update("company")}
                />
              </div>

              <div className="field">
                <label>Location <span className="req">*</span></label>
                <input
                  placeholder="e.g., San Diego, CA (Hybrid)"
                  value={form.location}
                  onChange={update("location")}
                />
              </div>

              <div className="field">
                <label>Job type</label>
                <select value={form.type} onChange={update("type")}>
                  <option>Full-time</option>
                  <option>Part-time</option>
                  <option>Contract</option>
                  <option>Internship</option>
                </select>
              </div>
            </div>
          </div>

          {/* COMP */}
          <div className="postjob-section">
            <div className="postjob-sectionTitle">Compensation</div>

            <div className="postjob-grid">
              <div className="field">
                <label>Salary <span className="req">*</span></label>
                <input
                  placeholder="e.g., $115k–$165k or $25–$35/hr"
                  value={form.salary}
                  onChange={update("salary")}
                />
              </div>

              <div className="field">
                <label>Availability</label>
                <input
                  placeholder="e.g., Start ASAP / Spring 2026"
                  value={form.availability}
                  onChange={update("availability")}
                />
              </div>
            </div>
          </div>

          {/* SOURCES */}
          <div className="postjob-section">
            <div className="postjob-sectionTitle">Sources</div>

            <div className="postjob-grid">
              <div className="field field--full">
                <label>Source URLs</label>
                <input
                  placeholder="Comma separated, e.g., company.com/careers, linkedin.com/jobs/..."
                  value={form.sources}
                  onChange={update("sources")}
                />
                <div className="hint">Optional — helps credibility.</div>
              </div>

              <div className="field field--full">
                <label>Source names</label>
                <input
                  placeholder="Comma separated, e.g., Company Site, LinkedIn"
                  value={form.sourceNames}
                  onChange={update("sourceNames")}
                />
              </div>
            </div>
          </div>

          {/* STATUS */}
          {(error || success) && (
            <div className={`postjob-alert ${error ? "is-error" : "is-success"}`}>
              {error ? error : "Job posted successfully. It’s now live in Jobs."}
            </div>
          )}

          {/* ACTIONS */}
          <div className="postjob-actions">
            <button
              className="postjob-btn postjob-btn--primary"
              disabled={submitting}
              type="submit"
            >
              {submitting ? "Posting..." : "Post job"}
            </button>

            <button
              className="postjob-btn"
              type="button"
              disabled={submitting}
              onClick={() => {
                setError("");
                setSuccess(false);
                setForm({
                  title: "",
                  company: "",
                  location: "",
                  type: "Full-time",
                  salary: "",
                  availability: "",
                  sources: "",
                  sourceNames: "",
                });
              }}
            >
              Clear
            </button>
          </div>

          <div className="postjob-footnote">
            Fields marked <span className="req">*</span> are required.
          </div>
        </form>
      </div>
    </div>
  );
}

export default PostJob;
