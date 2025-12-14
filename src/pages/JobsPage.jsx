import React, { useEffect, useMemo, useState } from "react";
import { apiGet } from "../api";
import JobCard from "../components/JobCard";

export default function JobsPage() {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    let ignore = false;

    async function load() {
      try {
        setLoading(true);
        setErrorMsg("");

        // CHANGE THIS if your backend uses a different route:
        const data = await apiGet("/api/jobs");

        if (!ignore) setJobs(Array.isArray(data) ? data : []);
      } catch (e) {
        if (!ignore) setErrorMsg(e.message || "Failed to load jobs.");
      } finally {
        if (!ignore) setLoading(false);
      }
    }

    load();
    return () => {
      ignore = true;
    };
  }, []);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return jobs;

    return jobs.filter((j) => {
      const blob = `${j.title || ""} ${j.company || ""} ${j.location || ""} ${j.type || ""}`.toLowerCase();
      return blob.includes(q);
    });
  }, [jobs, query]);

  return (
    <div className="container">
      <h1 className="pageTitle">Jobs</h1>
      <p className="muted">Search and filter the job listings from the backend.</p>

      <div className="searchRow">
        <label className="label">Search</label>
        <input
          className="input"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="title, company, location..."
        />
      </div>

      {loading ? <p>Loading…</p> : null}
      {errorMsg ? <p className="error">Error: {errorMsg}</p> : null}

      {!loading && !errorMsg ? (
        filtered.length ? (
          <div className="grid">
            {filtered.map((job, idx) => (
              <JobCard key={job.id ?? `${job.title}-${idx}`} job={job} />
            ))}
          </div>
        ) : (
          <p>No jobs found.</p>
        )
      ) : null}
    </div>
  );
}
