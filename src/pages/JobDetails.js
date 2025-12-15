// src/pages/JobDetails.js
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchJobById, saveJob, unsaveJob, fetchSavedJobIds } from "../api/jobs";
import "./JobDetails.css";

export default function JobDetails() {
  const { id } = useParams();
  const [job, setJob] = useState(null);
  const [savedIds, setSavedIds] = useState([]);
  const [err, setErr] = useState("");

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        setErr("");
        const [j, ids] = await Promise.all([fetchJobById(id), fetchSavedJobIds()]);
        if (!mounted) return;
        setJob(j);
        setSavedIds(ids || []);
      } catch (e) {
        if (!mounted) return;
        setErr(e.message || "Failed to load job");
      }
    })();

    return () => {
      mounted = false;
    };
  }, [id]);

  const isSaved = job ? savedIds.includes(job.id) : false;

  const toggleSave = async () => {
    try {
      const res = isSaved ? await unsaveJob(job.id) : await saveJob(job.id);
      setSavedIds(res.savedIds || []);
    } catch (e) {
      alert(e.message);
    }
  };

  const apply = () => {
    const url = job?.apply_url;
    if (!url) return alert("No apply link for this job.");
    window.open(url, "_blank");
  };

  if (err) {
    return (
      <div className="page">
        <div className="alert">{err}</div>
        <Link className="btn" to="/jobs">Back to jobs</Link>
      </div>
    );
  }

  if (!job) return <div className="page muted">Loading job...</div>;

  return (
    <div className="jobDetailsPage">
      <div className="jobDetailsCard">
        <div className="jdTop">
          <div>
            <h1 className="jdTitle">{job.title}</h1>
            <div className="jdMeta">
              <span className="jdCompany">{job.company}</span>
              <span className="dotSep">•</span>
              <span className="jdLoc">{job.location}</span>
            </div>
          </div>

          <div className="jdActions">
            <button className={isSaved ? "btn ghost saved" : "btn ghost"} onClick={toggleSave}>
              {isSaved ? "Saved" : "Save"}
            </button>
            <button className="btn" onClick={apply}>Apply</button>
          </div>
        </div>

        <div className="jdChips">
          <span className="chip">{job.type}</span>
          <span className="chip">{job.salary}</span>
          <span className="chip">{job.verification_score}% verified</span>
        </div>

        <div className="jdBody">
          <h3>About the role</h3>
          <pre className="jdDesc">{job.description}</pre>
        </div>

        <div className="jdFoot">
          <Link className="btn ghost" to="/jobs">← Back to jobs</Link>
        </div>
      </div>
    </div>
  );
}
