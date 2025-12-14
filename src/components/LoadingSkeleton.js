import React from 'react';
import './LoadingSkeleton.css';

function LoadingSkeleton({ count = 5 }) {
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <div key={index} className="skeleton-card">
          <div className="skeleton-header">
            <div className="skeleton-logo"></div>
            <div className="skeleton-title"></div>
            <div className="skeleton-date"></div>
          </div>
          <div className="skeleton-meta"></div>
          <div className="skeleton-badge"></div>
        </div>
      ))}
    </>
  );
}

export default LoadingSkeleton;