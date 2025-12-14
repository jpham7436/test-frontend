import React from 'react';
import './Sidebar.css';

function Sidebar({ type = 'left' }) {
  if (type === 'left') {
    return (
      <aside className="sidebar sidebar-left">
        <div className="sidebar-card">
          <h3 className="sidebar-title">Why JobHunting?</h3>
          <ul className="sidebar-list">
            <li>✓ Verified job postings</li>
            <li>✓ No fake listings</li>
            <li>✓ Direct company links</li>
            <li>✓ Real-time updates</li>
          </ul>
        </div>
      </aside>
    );
  }

  return (
    <aside className="sidebar sidebar-right">
      <div className="sidebar-card">
        <h3 className="sidebar-title">Featured Companies</h3>
        <ul className="sidebar-list">
          <li>Orbit Labs</li>
          <li>Pinecone Systems</li>
          <li>TechCorp</li>
          <li>StartupHub</li>
          <li>DevWorks</li>
        </ul>
      </div>
      
      <div className="sidebar-card">
        <h3 className="sidebar-title">Pro Tips</h3>
        <p className="sidebar-text">
          Customize your resume for each position. Highlight achievements with specific metrics and results.
        </p>
      </div>
    </aside>
  );
}

export default Sidebar;