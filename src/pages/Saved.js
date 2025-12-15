// src/pages/Saved.js
import React, { useEffect, useState } from "react";
import { fetchSavedJobs, fetchSavedJobIds, unsaveJob } from "../api/jobs";
import "./Saved.css";

export default function Saved() {
  const [jobs, setJobs] = useState([]);
  const [savedIds, setSavedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setLoading(true);
        setErr("");
        const [list, ids] = await Promise.all([fetchSavedJobs(), fetchSavedJobIds()]);
        if (!mounted) return;
        setJobs(Array.isArray(list) ? list : []);
        setSavedIds(ids || []);
      } catch (e) {
        if (!mounted) return;
        setErr(e.message || "Failed to load saved jobs");
      } finally {
        if (!mounted) return;
        setLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

  const remove = async (jobId) => {
    try {
      const res = await unsaveJob(jobId);
      const nextIds = res.savedIds || [];
      setSavedIds(nextIds);
      setJobs((prev) => prev.filter((j) => j.id !== jobId));
    } catch (e) {
      alert(e.message);
    }
  };

  return (
    <div className="page">
      <div className="pageHeader">
        <div>
          <h2>Saved Jobs</h2>
          <p className="muted">Your bookmarked listings.</p>
        </div>
      </div>

      {err && <div className="alert">{err}</div>}

      {loading ? (
        <div className="muted">Loading...</div>
      ) : jobs.length === 0 ? (
        <div className="emptyBox">No saved jobs yet.</div>
      ) : (
        <div className="savedGrid">
          {jobs.map((job) => (
            <div key={job.id} className="savedCard">
              <div className="savedTop">
                <div className="savedTitle">{job.title}</div>
                <div className="badge verified">{job.verdict === "certified" ? "Verified" : "Standard"}</div>
              </div>
              <div className="muted">{job.company} • {job.location}</div>
              <div className="muted">{job.type} • {job.salary}</div>

              <div className="savedActions">
                <button className="btn ghost" onClick={() => remove(job.id)}>Remove</button>
                <a className="btn" href={job.apply_url} target="_blank" rel="noreferrer">Apply</a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
