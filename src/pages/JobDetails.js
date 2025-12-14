import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { fetchJobs } from '../api/jobs';
import { saveJob, unsaveJob, isJobSaved } from '../utils/savedJobs';
import './JobDetails.css';

function JobDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [job, setJob] = useState(null);
  const [similarJobs, setSimilarJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    const loadJobDetails = async () => {
      try {
        setLoading(true);
        const allJobs = await fetchJobs();
        const currentJob = allJobs.find(j => j.id === id);
        
        if (!currentJob) {
          setError('Job not found');
          return;
        }

        setJob(currentJob);
        setSaved(isJobSaved(id));

        const similar = allJobs
          .filter(j => 
            j.id !== id && 
            (j.company === currentJob.company || j.type === currentJob.type)
          )
          .slice(0, 3);
        
        setSimilarJobs(similar);
      } catch (err) {
        setError('Failed to load job details');
      } finally {
        setLoading(false);
      }
    };

    loadJobDetails();
  }, [id]);

  const handleSaveToggle = () => {
    if (saved) {
      unsaveJob(id);
      setSaved(false);
    } else {
      saveJob(id);
      setSaved(true);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  if (loading) {
    return (
      <div className="job-details-container">
        <div className="job-details-loading">Loading job details...</div>
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className="job-details-container">
        <div className="job-details-error">
          <p>{error || 'Job not found'}</p>
          <button onClick={() => navigate('/jobs')} className="back-btn">
            Back to Jobs
          </button>
        </div>
      </div>
    );
  }

  const postedDate = job.posted_at || job.postedAt;

  return (
    <div className="job-details-container">
      <div className="job-details-main">
        <button onClick={() => navigate(-1)} className="back-link">
          ← Back to Search
        </button>

        <div className="job-details-card">
          <div className="job-details-header">
            <div className="job-details-logo">
              {(job.company || '?')[0].toUpperCase()}
            </div>
            <div className="job-details-title-section">
              <h1>{job.title}</h1>
              <p className="job-details-company">{job.company}</p>
              <div className="job-details-meta">
                <span>{job.location}</span>
                <span>•</span>
                <span>{job.type}</span>
                {job.salary && (
                  <>
                    <span>•</span>
                    <span>{job.salary}</span>
                  </>
                )}
              </div>
              {postedDate && (
                <p className="job-details-posted">Posted on {formatDate(postedDate)}</p>
              )}
            </div>
          </div>

          {job.verdict && (
            <div className="job-details-badge-section">
              <span className={`badge-large ${job.verdict.toLowerCase() === 'certified' ? 'certified' : 'pending'}`}>
                {job.verdict}
              </span>
              {job.verification_score && (
                <span className="verification-score-large">
                  {Math.round(job.verification_score * 100)}% Verification Score
                </span>
              )}
            </div>
          )}

          <div className="job-details-actions">
            <button className="apply-btn" onClick={() => alert('Apply functionality coming soon!')}>
              Apply Now
            </button>
            <button 
              className={`save-btn ${saved ? 'saved' : ''}`}
              onClick={handleSaveToggle}
            >
              {saved ? '✓ Saved' : 'Save Job'}
            </button>
          </div>

          {job.source_urls && job.source_urls.length > 0 && (
            <div className="job-details-sources">
              <h3>Verified Sources</h3>
              <div className="sources-list">
                {job.source_urls.map((url, index) => (
                  <a 
                    key={index} 
                    href={url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="source-link"
                  >
                    {job.source_names && job.source_names[index] ? job.source_names[index] : `Source ${index + 1}`}
                  </a>
                ))}
              </div>
            </div>
          )}

          <div className="job-details-section">
            <h2>About the Role</h2>
            <p>
              This is a {job.type.toLowerCase()} position at {job.company} located in {job.location}. 
              We're looking for talented individuals to join our team and contribute to exciting projects.
            </p>
            {job.availability && (
              <p className="availability-info">
                <strong>Expected Start:</strong> {job.availability}
              </p>
            )}
          </div>
        </div>

        {similarJobs.length > 0 && (
          <div className="similar-jobs-section">
            <h2>Similar Opportunities</h2>
            <div className="similar-jobs-grid">
              {similarJobs.map(similarJob => (
                <div 
                  key={similarJob.id} 
                  className="similar-job-card"
                  onClick={() => navigate(`/jobs/${similarJob.id}`)}
                >
                  <div className="similar-job-logo">
                    {(similarJob.company || '?')[0].toUpperCase()}
                  </div>
                  <h3>{similarJob.title}</h3>
                  <p className="similar-job-company">{similarJob.company}</p>
                  <p className="similar-job-meta">
                    {similarJob.location} • {similarJob.type}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default JobDetails;