import React, { useEffect, useMemo, useState } from "react";
import { Routes, Route, Link } from "react-router-dom";
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

// Job Card: containers for job postings on "Find a Job" subpage
// Takes form submissions and displays the information in a readable format.
function JobCard({ job }) {
  return (
    <article key={job.id} className="card">
      <div className="card-head">
        <div className="logo">{(job.company || "?")[0]}</div>
        <div>
          <h3>{job.title}</h3>
          <p className="muted">
            {job.company} • {job.location} • {job.type}
          </p>
        </div>
        <div
          className="badge-wrap"
          title={`score ${Math.round((job.verification_score || 0) * 100)}%`}
        >
          <span
            className={`badge ${
              String(job.verdict).toLowerCase() === "certified" ? "ok" : "warn"
            }`}
          >
            {job.verdict || "Unverified"}
          </span>
        </div>
      </div>

      <div className="tags">
        {job.salary && <span className="tag">{job.salary}</span>}
        {job.posted_at && (
          <span className="tag">
            {new Date(job.posted_at).toLocaleDateString()}
          </span>
        )}
      </div>

      {Array.isArray(job.source_urls) && job.source_urls.length > 0 && (
        <div className="sources muted">
          Sources:{" "}
          {job.source_urls
            .map((u, i) => {
              const name =
                (job.source_names && job.source_names[i]) || "source";
              return (
                <a key={u + i} href={u} target="_blank" rel="noreferrer">
                  {name}
                </a>
              );
            })
            .reduce((prev, curr) => (prev === null ? [curr] : [...prev, " • ", curr]), null)}
        </div>
      )}
    </article>
  );
}

// "Post a Job" subpage
// Form requires the user to submit information for all fields except formSourceNames.
// Clicking "Submit job" button submits the form to the backend.
function AddJobPage({
  formState,
  handlers,
  submitting,
  errorMessage,
  onSubmit,
}) {
  const {
    formTitle,
    formCompany,
    formLocation,
    formType,
    formSalary,
    formAvailability,
    formSources,
    formSourceNames,
  } = formState;

  const {
    setFormTitle,
    setFormCompany,
    setFormLocation,
    setFormType,
    setFormSalary,
    setFormAvailability,
    setFormSources,
    setFormSourceNames,
  } = handlers;

  return (
    <section className="hero">
      <h1>Add a job posting</h1>

      <form className="add-job-form" onSubmit={onSubmit}>
        <label>
          Job title*
          <input
            type="text"
            value={formTitle}
            onChange={(e) => setFormTitle(e.target.value)}
          />
        </label>

        <label>
          Company*
          <input
            type="text"
            value={formCompany}
            onChange={(e) => setFormCompany(e.target.value)}
          />
        </label>

        <label>
          Location*
          <input
            type="text"
            value={formLocation}
            onChange={(e) => setFormLocation(e.target.value)}
            placeholder="e.g., Remote, San Diego"
          />
        </label>

        <label>
          Type*
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
          Salary range*
          <input
            type="text"
            value={formSalary}
            onChange={(e) => setFormSalary(e.target.value)}
            placeholder="$100k–$130k"
          />
        </label>

        <label>
          Expected availability*
          <input
            type="text"
            value={formAvailability}
            onChange={(e) => setFormAvailability(e.target.value)}
            placeholder="e.g., Q1 2026, ASAP"
          />
        </label>

        <label>
          Source URLs (comma separated)*
          <input
            type="text"
            value={formSources}
            onChange={(e) => setFormSources(e.target.value)}
            placeholder="https://company.com/jobs/..., https://linkedin.com/..."
          />
        </label>

        <label>
          Source names (optional)
          <input
            type="text"
            value={formSourceNames}
            onChange={(e) => setFormSourceNames(e.target.value)}
            placeholder="Company Site, LinkedIn"
          />
        </label>

        {errorMessage && <div className="form-error">{errorMessage}</div>}

        <div className="add-job-actions">
          <button type="submit" disabled={submitting}>
            {submitting ? "Submitting…" : "Submit job"}
          </button>
        </div>
      </form>
    </section>
  );
}

// "Find a Job" subpage
// Search fields to find job postings by job title/company or location. Other fields are not queried.
// Certified only checkbox should filter only jobs that are labeled "certified."
// Certification currently does not work, so all new posted jobs will automatically be labeled certified.
function JobsPage({ visible, q, setQ, location, setLocation, certifiedOnly, setCertifiedOnly, sort, setSort, loading, usingDemo }) {
  return (
    <>
      <section className="hero">
        <h1>Search for job postings</h1>

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

      <section className="featured">
        <h2>Job listings</h2>
        <div className="cards">
          {visible.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </section>
    </>
  );
}

// Homepage
// Currently just exists to look nice. The main content of the site is accessed via the navbar.
// Potentially can add buttons to link directly to the search and posting subpages.
function HomePage() {
  return (
    <>
      <section className="hero">
        <h1>Find real jobs, fast.</h1>
        <p className="sub">
          Certified Jobs helps employers and employees alike.
        </p>
      </section>
      
      <section className="content">
        <div style={{ textAlign: "center" }}>
          <img src="/image.jpg" alt="A team of people sitting in a workspace" title="Image by Matheus Bertelli (pexels.com)" style={{ width: "600px", height: "auto"}}/>
        </div>
        <p className="blurb">
          Ad possimus necessitatibus placeat dolores magnam optio. Tenetur ipsum maiores eos laboriosam. Ut commodi ad culpa earum atque in. Quaerat aut quidem accusamus eum dolor. Ipsum voluptatem quam quis dolor cupiditate error ut. Magni ut nostrum aliquam molestiae et eaque.
          Iure culpa aut minus nulla libero. Reiciendis nisi est eaque beatae ut. Quis fugiat facere aliquam quia. Nisi est iste dolor tempora. Facere porro velit esse porro ea fugit totam. Exercitationem vel qui eos sapiente inventore commodi.
          Accusamus eaque placeat ut omnis autem perspiciatis et in. Fugit mollitia earum ut eaque ducimus. Sunt labore consequatur velit velit aliquam et.
          Porro rerum et eos earum excepturi minus. Modi itaque est accusantium exercitationem beatae exercitationem. Commodi sed asperiores dolor esse fuga non mollitia. Iure omnis qui voluptatem blanditiis est quas. Eum fugiat veritatis eligendi. Voluptatem id consequatur numquam ratione rerum.
          Quia corrupti beatae ea. Sint non ut totam nisi cumque asperiores. Sit saepe sed et. In perspiciatis quam nesciunt. Modi maxime voluptatem ut ut ipsa. Autem voluptatum sed aut placeat impedit.
        </p>
        <h2>How it works</h2>
        <ul className="steps">
          <li><b>ingest</b> jobs</li>
          <li><b>verify</b> with backend scoring</li>
          <li><b>publish</b> certified results</li>
        </ul>
      </section>
    </>
  );
}

export default function App() {
  const API = process.env.REACT_APP_API_URL || "http://localhost:5000";

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [usingDemo, setUsingDemo] = useState(false);
  const [q, setQ] = useState("");
  const [location, setLocation] = useState("");
  const [certifiedOnly, setCertifiedOnly] = useState(true);
  const [sort, setSort] = useState("recent"); // recent | score

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
        if (!res.ok) throw new Error();
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
        certifiedOnly
          ? (j.verdict || "").toLowerCase() === "certified"
          : true
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
        if (sort === "score")
          return (b.verification_score || 0) - (a.verification_score || 0);

        // recent (fallback to posted_at)
        const da = new Date(a.posted_at || 0).getTime();
        const db = new Date(b.posted_at || 0).getTime();
        return db - da;
      });
  }, [jobs, q, location, certifiedOnly, sort]);

  async function handleAddJobSubmit(e) {
    e.preventDefault();
    setFormError("");

    if (!formTitle.trim() || !formCompany.trim() || !formLocation.trim() || !formType.trim() || !formSalary.trim() || !formAvailability.trim() || !formSources.trim()) {
      setFormError("One or more fields are missing.");
      return;
    }

    setFormSubmitting(true);

    try {
      // Process sources into arrays
      const urlParts = formSources
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
        .map((url) =>
          // auto-prefix https:// if missing so links don't go to localhost
          !url.startsWith("http://") && !url.startsWith("https://")
            ? "https://" + url
            : url
        );

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

      if (!res.ok) throw new Error();
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
    } catch (err) {
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
          <Link to="/">Home</Link>
          <Link to="/jobs">Find a Job</Link>
          <Link to="/post">Post a Job</Link>
        </nav>
      </header>

      {/* Router Pages */}
      <Routes>
        <Route path="/" element={<HomePage />} />

        <Route
          path="/jobs"
          element={
            <JobsPage
              visible={visible}
              q={q}
              setQ={setQ}
              location={location}
              setLocation={setLocation}
              certifiedOnly={certifiedOnly}
              setCertifiedOnly={setCertifiedOnly}
              sort={sort}
              setSort={setSort}
              loading={loading}
              usingDemo={usingDemo}
            />
          }
        />

        <Route
          path="/post"
          element={
            <AddJobPage
              formState={{
                formTitle,
                formCompany,
                formLocation,
                formType,
                formSalary,
                formAvailability,
                formSources,
                formSourceNames,
              }}
              handlers={{
                setFormTitle,
                setFormCompany,
                setFormLocation,
                setFormType,
                setFormSalary,
                setFormAvailability,
                setFormSources,
                setFormSourceNames,
              }}
              errorMessage={formError}
              submitting={formSubmitting}
              onSubmit={handleAddJobSubmit}
            />
          }
        />
      </Routes>

      <footer className="footer">
        <span>© {new Date().getFullYear()} Certified Jobs</span>
      </footer>
    </div>
  );
}
