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

  // Fetch with polling. Comment this block out if you want to stay on demo data only.
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
        q ? (j.title + " " + j.company).toLowerCase().includes(q.toLowerCase()) : true
      )
      .filter((j) =>
        location ? (j.location || "").toLowerCase().includes(location.toLowerCase()) : true
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

  return (
    <div className="app">
      <header className="nav">
        <div className="brand">Certified Jobs</div>
        <nav className="links">
          <a href="#jobs">Jobs</a>
          <a href="#how">How it works</a>
        </nav>
      </header>

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
          <div><strong>{visible.length}</strong> results</div>
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
                <div className="logo">{(job.company || "?")[0]}</div>
                <div>
                  <h3>{job.title}</h3>
                  <p className="muted">
                    {job.company} • {job.location} • {job.type}
                  </p>
                </div>
                <div className="badge-wrap" title={`score ${Math.round((job.verification_score || 0) * 100)}%`}>
                  <span className={`badge ${String(job.verdict).toLowerCase() === "certified" ? "ok" : "warn"}`}>
                    {job.verdict || "Unverified"}
                  </span>
                </div>
              </div>

              <div className="tags">
                {job.salary ? <span className="tag">{job.salary}</span> : null}
                {job.posted_at ? (
                  <span className="tag">
                    {new Date(job.posted_at).toLocaleDateString()}
                  </span>
                ) : null}
              </div>

              {Array.isArray(job.source_urls) && job.source_urls.length > 0 && (
                <div className="sources muted">
                  Sources: {job.source_urls.map((u, i) => {
                    const name = (job.source_names && job.source_names[i]) || "source";
                    return (
                      <a key={u + i} href={u} target="_blank" rel="noreferrer">
                        {name}
                      </a>
                    );
                  }).reduce((prev, curr) => (prev === null ? [curr] : [...prev, " • ", curr]), null)}
                </div>
              )}
            </article>
          ))}
        </div>
      </section>

      <section id="how" className="how">
        <h2>How it works</h2>
        <ul className="steps">
          <li><b>ingest</b> jobs from employers or feeds</li>
          <li><b>verify</b> with backend rules and scoring</li>
          <li><b>publish</b> only certified results</li>
        </ul>
      </section>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Certified Jobs</span>
      </footer>
    </div>
  );
}
