import React, { useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { fetchJobById, fetchSavedJobIds, saveJob, unsaveJob } from "../api/jobs";
import LoadingSkeleton from "../components/LoadingSkeleton";

function buildFallbackApply(company) {
  const q = encodeURIComponent(`${company || "company"} careers`);
  return `https://www.google.com/search?q=${q}`;
}

function JobDetails() {
  const { id } = useParams();

  const [job, setJob] = useState(null);
  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const [j, saved] = await Promise.all([
        fetchJobById(id),
        fetchSavedJobIds(),
      ]);

      setJob(j);
      setSavedIds(new Set((saved || []).map(String)));
    } catch (err) {
      // show better message
      setError("Failed to load job. (Job may not exist or backend isn't running)");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const isSaved = job ? savedIds.has(String(job.id)) : false;

  const applyHref = useMemo(() => {
    if (!job) return "";
    const raw = job.apply_url || job.applyUrl || job.url || "";
    return raw ? raw : buildFallbackApply(job.company);
  }, [job]);

  const toggleSave = async () => {
    if (!job?.id) return;
    const jobId = String(job.id);
    const currentlySaved = savedIds.has(jobId);

    // optimistic UI
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (currentlySaved) next.delete(jobId);
      else next.add(jobId);
      return next;
    });

    try {
      if (currentlySaved) await unsaveJob(jobId);
      else await saveJob(jobId);
    } catch {
      // revert
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.add(jobId);
        else next.delete(jobId);
        return next;
      });
    }
  };

  if (loading) return <LoadingSkeleton count={1} />;
  if (error) return <p style={{ padding: 24 }}>{error}</p>;
  if (!job) return <p style={{ padding: 24 }}>Job not found</p>;

  return (
    <div style={{ maxWidth: 900, margin: "0 auto", padding: 24 }}>
      <Link to="/jobs" style={{ textDecoration: "none" }}>
        ← Back to Search
      </Link>

      <div className="job-detail__card" style={{ marginTop: 16 }}>
        <div className="job-detail__head">
          <div className="job-detail__logo" aria-hidden="true">
            {(job.company || "J")[0]?.toUpperCase()}
          </div>
          <div className="job-detail__headText">
            <div className="job-detail__title">{job.title || "Untitled Role"}</div>
            <div className="job-detail__meta">
              <span className="job-detail__company">{job.company || "Unknown Company"}</span>
              <span className="job-detail__dot">•</span>
              <span>{job.location || "Location not listed"}</span>
            </div>
          </div>
        </div>

        <div className="job-detail__ctaRow">
          {/* ✅ REAL APPLY LINK */}
          <a
            className="btn btn--primary"
            href={applyHref}
            target="_blank"
            rel="noopener noreferrer"
          >
            Apply Now
          </a>

          <button className="btn btn--ghost" type="button" onClick={toggleSave}>
            {isSaved ? "Saved ★" : "Save Job"}
          </button>
        </div>

        <div className="job-detail__section">
          <div className="job-detail__sectionTitle">About the role</div>
          <div className="job-detail__desc">{job.description || "No description provided."}</div>
        </div>
      </div>
    </div>
  );
}

export default JobDetails;
