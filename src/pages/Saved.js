import React, { useState, useEffect } from 'react';
import { fetchJobs } from '../api/jobs';
import { getSavedJobs, unsaveJob } from '../utils/savedJobs';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './Saved.css';

function Saved() {
  const [savedJobs, setSavedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadSavedJobs = async () => {
      try {
        setLoading(true);
        const savedIds = getSavedJobs();
        
        if (savedIds.length === 0) {
          setSavedJobs([]);
          setLoading(false);
          return;
        }

        const allJobs = await fetchJobs();
        const saved = allJobs.filter(job => savedIds.includes(job.id));
        setSavedJobs(saved);
      } catch (err) {
        setError('Failed to load saved jobs');
      } finally {
        setLoading(false);
      }
    };

    loadSavedJobs();
  }, []);

  const handleUnsave = (jobId, e) => {
    e.stopPropagation();
    unsaveJob(jobId);
    setSavedJobs(prev => prev.filter(job => job.id !== jobId));
  };

  return (
    <div className="saved-container">
      <div className="saved-header">
        <h1>Saved Jobs</h1>
        <p className="saved-subtitle">
          {savedJobs.length} {savedJobs.length === 1 ? 'job' : 'jobs'} saved
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
          <p>Browse jobs and click "Save Job" to bookmark positions you're interested in.</p>
        </div>
      )}

      {!loading && savedJobs.length > 0 && (
        <div className="saved-jobs">
          {savedJobs.map(job => (
            <div key={job.id} className="saved-job-wrapper">
              <JobCard job={job} />
              <button 
                className="unsave-btn"
                onClick={(e) => handleUnsave(job.id, e)}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Saved