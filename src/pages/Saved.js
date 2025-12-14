import React, { useEffect, useState } from "react";
import { fetchSavedJobs, unsaveJob } from "../api/jobs";
import JobCard from "../components/JobCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import "./Saved.css";

function Saved() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await fetchSavedJobs();
      setSavedJobs(Array.isArray(data) ? data : []);
    } catch {
      setError("Failed to load saved jobs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  const remove = async (id) => {
    try {
      await unsaveJob(id);
      setSavedJobs((prev) => prev.filter((j) => String(j.id) !== String(id)));
    } catch {
      setError("Failed to remove saved job");
    }
  };

  return (
    <div className="saved-container">
      <div className="saved-header">
        <h1>Saved Jobs</h1>
        <p className="saved-subtitle">
          {savedJobs.length} {savedJobs.length === 1 ? "job" : "jobs"} saved
        </p>
      </div>

      {loading && (
        <div className="saved-jobs">
          <LoadingSkeleton count={3} />
        </div>
      )}

      {error && (
        <div className="error-message">
          <p>{error}</p>
        </div>
      )}

      {!loading && savedJobs.length === 0 && (
        <div className="empty-message">
          <h3>No saved jobs yet</h3>
          <p>Browse jobs and click ☆ / Save to bookmark positions.</p>
        </div>
      )}

      {!loading && savedJobs.length > 0 && (
        <div className="saved-jobs">
          {savedJobs.map((job) => (
            <div key={job.id} className="saved-job-wrapper">
              <JobCard job={job} />
              <button className="unsave-btn" onClick={() => remove(job.id)}>
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Saved;
