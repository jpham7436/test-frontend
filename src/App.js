import React, { useEffect, useMemo, useState } from "react";
import "./App.css";

const DEMO_JOBS = [
  {
    id: "demo-1",
    title: "Frontend Developer",
    company: "Orbit Labs",
    location: "San Diego, CA",
    type: "Full Time",
    salary: "$95k–$120k",
    verdict: "Certified",
    verification_score: 0.88,
    posted_at: "2025-10-18T12:05:00Z",
    source_names: ["Company Site", "LinkedIn"],
    source_urls: ["#", "#"],
  },
  {
    id: "demo-2",
    title: "Backend Engineer",
    company: "Pinecone Systems",
    location: "Remote (US)",
    type: "Full Time",
    salary: "$120k–$150k",
    verdict: "Certified",
    verification_score: 0.92,
    posted_at: "2025-10-18T12:05:00Z",
    source_names: ["Lever", "LinkedIn"],
    source_urls: ["#", "#"],
  },
];

export default function App() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingDemo, setUsingDemo] = useState(false);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [certifiedOnly, setCertifiedOnly] = useState(true);
  const [sort, setSort] = useState("recent"); // recent | score

  // View: "list" (default) or "add"
  const [view, setView] = useState("list");

  // Add Job form state
  const [formTitle, setFormTitle] = useState("");
  const [formCompany, setFormCompany] = useState("");
  const [formLocation, setFormLocation] = useState("");
  const [formType, setFormType] = useState("Full Time");
  const [formSalary, setFormSalary] = useState("");
  const [formAvailability, setFormAvailability] = useState("");
  const [formSources, setFormSources] = useState("");      // comma-separated URLs
  const [formSourceNames, setFormSourceNames] = useState(""); // comma-separated names
  const [formError, setFormError] = useState("");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Fetch with polling
  useEffect(() => {
    let alive = true;

    async function fetchJobs() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        if (location) params.set("location", location);
        if (certifiedOnly) params.set("certified", "true");
        if (sort) params.set("sort", sort);

        const res = await fetch(`${API}/api/jobs?${params.toString()}`);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data = await res.json();
        if (!alive) return;
        setJobs(Array.isArray(data) ? data : []);
        setUsingDemo(false);
      } catch (_) {
        if (!alive) return;
        // Fallback to demo data so UI still works
        setJobs(DEMO_JOBS);
        setUsingDemo(true);
      } finally {
        if (alive) setLoading(false);
      }
    }

    fetchJobs();
    const id = setInterval(fetchJobs, 15000); // 15s
    return () => {
      alive = false;
      clearInterval(id);
    };
  }, [API, q, location, certifiedOnly, sort]);

  const visible = useMemo(() => {
    // Defensive client-side filter if backend ignores params
    return jobs
      .filter((j) =>
        certifiedOnly ? (j.verdict || "").toLowerCase() === "certified" : true
      )
      .filter((j) =>
        q
          ? (j.title + " " + j.company)
              .toLowerCase()
              .includes(q.toLowerCase())
          : true
      )
      .filter((j) =>
        location
          ? (j.location || "").toLowerCase().includes(location.toLowerCase())
          : true
      )
      .sort((a, b) => {
        if (sort === "score") {
          return (b.verification_score || 0) - (a.verification_score || 0);
        }
        // recent (fallback to posted_at)
        const da = new Date(a.posted_at || 0).getTime();
        const db = new Date(b.posted_at || 0).getTime();
        return db - da;
      });
  }, [jobs, q, location, certifiedOnly, sort]);

  async function handleAddJobSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim() || !formCompany.trim()) {
      setFormError("Job title and company are required.");
      return;
    }

    setFormSubmitting(true);

    try {
      // Process sources into arrays
      const urlParts = formSources
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url) => {
          // auto-prefix https:// if missing so links don't go to localhost
          if (!url.startsWith("http://") && !url.startsWith("https://")) {
            return "https://" + url;
          }
          return url;
        });

      const nameParts = formSourceNames
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const source_urls = urlParts;
      const source_names = urlParts.map(
        (_, idx) => nameParts[idx] || "source"
      );

      const res = await fetch(`${API}/api/jobs`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: formTitle,
          company: formCompany,
          location: formLocation,
          type: formType,
          salary: formSalary,
          availability: formAvailability,
          source_names,
          source_urls,
        }),
      });

      if (!res.ok) {
        const text = await res.text();
        throw new Error(text || `HTTP ${res.status}`);
      }

      const created = await res.json();

      // Optimistically add to local list so it appears immediately
      setJobs((prev) => [...prev, created]);

      // Reset form
      setFormTitle("");
      setFormCompany("");
      setFormLocation("");
      setFormType("Full Time");
      setFormSalary("");
      setFormAvailability("");
      setFormSources("");
      setFormSourceNames("");
      setFormError("");

      // Go back to main job list
      setView("list");
    } catch (err) {
      console.error(err);
      setFormError("Failed to add job. Please try again.");
    } finally {
      setFormSubmitting(false);
    }
  }

  return (
    <div className="app">
      <header className="nav">
        <div className="brand">Certified Jobs</div>
        <nav className="links">
          <a
            href="#jobs"
            onClick={(e) => {
              e.preventDefault();
              setView("list");
              const section = document.getElementById("jobs");
              if (section) section.scrollIntoView({ behavior: "smooth" });
            }}
          >
            Jobs
          </a>
          <a
            href="#how"
            onClick={(e) => {
              e.preventDefault();
              setView("list");
              const section = document.getElementById("how");
              if (section) section.scrollIntoView({ behavior: "smooth" });
            }}
          >
            How it works
          </a>
          <a
            href="#add-job"
            onClick={(e) => {
              e.preventDefault();
              setView("add");
            }}
          >
            Add Job
          </a>
        </nav>
      </header>

      {view === "add" ? (
        <section id="add-job" className="hero">
          <h1>Add a job posting</h1>
          <p className="sub">
            Simulate a company posting a new role. It will be stored in the
            backend and appear in the job list.
          </p>

          <form className="add-job-form" onSubmit={handleAddJobSubmit}>
            <label>
              Job title*
              <input
                type="text"
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                required
              />
            </label>

            <label>
              Company*
              <input
                type="text"
                value={formCompany}
                onChange={(e) => setFormCompany(e.target.value)}
                required
              />
            </label>

            <label>
              Location
              <input
                type="text"
                value={formLocation}
                onChange={(e) => setFormLocation(e.target.value)}
                placeholder="e.g., Remote, San Diego, CA"
              />
            </label>

            <label>
              Type
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value)}
              >
                <option>Full Time</option>
                <option>Part Time</option>
                <option>Contract</option>
                <option>Internship</option>
              </select>
            </label>

            <label>
              Salary range
              <input
                type="text"
                value={formSalary}
                onChange={(e) => setFormSalary(e.target.value)}
                placeholder="$100k–$130k"
              />
            </label>

            <label>
              Expected availability
              <input
                type="text"
                value={formAvailability}
                onChange={(e) => setFormAvailability(e.target.value)}
                placeholder="e.g., Q1 2026, ASAP"
              />
            </label>

            <label>
              Source URLs (comma separated)
              <input
                type="text"
                value={formSources}
                onChange={(e) => setFormSources(e.target.value)}
                placeholder="https://company.com/jobs/frontend, https://linkedin.com/..."
              />
            </label>

            <label>
              Source names (optional, comma separated)
              <input
                type="text"
                value={formSourceNames}
                onChange={(e) => setFormSourceNames(e.target.value)}
                placeholder="Company Site, LinkedIn"
              />
            </label>

            {formError && <div className="form-error">{formError}</div>}

            <div className="add-job-actions">
              <button type="submit" disabled={formSubmitting}>
                {formSubmitting ? "Submitting…" : "Submit job"}
              </button>
              <button
                type="button"
                className="secondary"
                onClick={() => {
                  setView("list");
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </section>
      ) : (
        <>
          <section className="hero">
            <h1>Find real jobs, fast.</h1>
            <p className="sub">
              Backend verifies postings. Frontend lists only certified results.
            </p>

            <form className="search" onSubmit={(e) => e.preventDefault()}>
              <input
                placeholder="Search (e.g., React, internship)"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
              <input
                placeholder="Location (e.g., Remote, San Diego)"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              />
              <button type="submit">Search</button>
            </form>

            <div className="stats" aria-live="polite">
              <div>
                <strong>{visible.length}</strong> results
              </div>
              <div>
                <label style={{ userSelect: "none" }}>
                  <input
                    type="checkbox"
                    checked={certifiedOnly}
                    onChange={(e) => setCertifiedOnly(e.target.checked)}
                    style={{ marginRight: 6 }}
                  />
                  certified only
                </label>
              </div>
              <div>
                <label>
                  sort:
                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value)}
                    style={{ marginLeft: 6 }}
                  >
                    <option value="recent">recent</option>
                    <option value="score">score</option>
                  </select>
                </label>
              </div>
              {loading && <div>loading…</div>}
              {usingDemo && <div>using demo data</div>}
            </div>
          </section>

          <section id="jobs" className="featured">
            <h2>Certified openings</h2>
            <div className="cards">
              {visible.map((job) => (
                <article key={job.id} className="card">
                  <div className="card-head">
                    {/* First letter of company as a simple "logo" */}
                    <div className="logo">{(job.company || "?")[0]}</div>
                    <div>
                      <h3>{job.title}</h3>
                      <p className="muted">
                        {job.company} • {job.location} • {job.type}
                      </p>
                    </div>
                    <div
                      className="badge-wrap"
                      title={`score ${Math.round(
                        (job.verification_score || 0) * 100
                      )}%`}
                    >
                      <span
                        className={`badge ${
                          String(job.verdict).toLowerCase() === "certified"
                            ? "ok"
                            : "warn"
                        }`}
                      >
                        {job.verdict || "Unverified"}
                      </span>
                    </div>
                  </div>

                  <div className="tags">
                    {job.salary ? (
                      <span className="tag">{job.salary}</span>
                    ) : null}
                    {job.posted_at ? (
                      <span className="tag">
                        {new Date(job.posted_at).toLocaleDateString()}
                      </span>
                    ) : null}
                  </div>

                  {Array.isArray(job.source_urls) &&
                    job.source_urls.length > 0 && (
                      <div className="sources muted">
                        Sources:{" "}
                        {job.source_urls
                          .map((u, i) => {
                            const name =
                              (job.source_names && job.source_names[i]) ||
                              "source";
                            return (
                              <a
                                key={u + i}
                                href={u}
                                target="_blank"
                                rel="noreferrer"
                              >
                                {name}
                              </a>
                            );
                          })
                          .reduce(
                            (prev, curr) =>
                              prev === null ? [curr] : [...prev, " • ", curr],
                            null
                          )}
                      </div>
                    )}
                </article>
              ))}
            </div>
          </section>

          <section id="how" className="how">
            <h2>How it works</h2>
            <ul className="steps">
              <li>
                <b>ingest</b> jobs from employers or feeds
              </li>
              <li>
                <b>verify</b> with backend rules and scoring
              </li>
              <li>
                <b>publish</b> only certified results
              </li>
            </ul>
          </section>
        </>
      )}

      <footer className="footer">
        <span>© {new Date().getFullYear()} Certified Jobs</span>
      </footer>
    </div>
  );
}
