import React from 'react';
import { useNavigate } from 'react-router-dom';
import './JobCard.css';

function JobCard({ job }) {
  const navigate = useNavigate();

  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now - date);
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
    return `${Math.floor(diffDays / 30)} months ago`;
  };

  // Handle both posted_at and postedAt field names
  const postedDate = job.posted_at || job.postedAt;

  return (
    <div className="job-card" onClick={() => navigate(`/jobs/${job.id}`)}>
      <div className="job-card-header">
        <div className="job-card-logo">
          {(job.company || '?')[0].toUpperCase()}
        </div>
        <div className="job-card-title-section">
          <h3 className="job-card-title">{job.title}</h3>
          <div className="job-card-company">{job.company}</div>
        </div>
        {postedDate && (
          <span className="job-card-date">{formatDate(postedDate)}</span>
        )}
      </div>
      
      <div className="job-card-meta">
        <span className="job-card-location">{job.location}</span>
        <span className="job-card-dot">•</span>
        <span className="job-card-type">{job.type}</span>
        {job.salary && (
          <>
            <span className="job-card-dot">•</span>
            <span className="job-card-salary">{job.salary}</span>
          </>
        )}
      </div>
      
      {job.verdict && (
        <div className="job-card-badge">
          <span className={`badge ${job.verdict.toLowerCase() === 'certified' ? 'certified' : 'pending'}`}>
            {job.verdict}
          </span>
          {job.verification_score && (
            <span className="verification-score">
              {Math.round(job.verification_score * 100)}% verified
            </span>
          )}
        </div>
      )}
    </div>
  );
}

export default JobCard;