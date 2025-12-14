import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { fetchJobs } from '../api/jobs';
import JobCard from '../components/JobCard';
import LoadingSkeleton from '../components/LoadingSkeleton';
import './Jobs.css';

function Jobs() {
  const [searchParams] = useSearchParams();
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const [filters, setFilters] = useState({
    search: searchParams.get('search') || '',
    type: '',
    location: '',
    certifiedOnly: true,
    sort: 'recent'
  });

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        const data = await fetchJobs();
        setJobs(data);
      } catch (err) {
        setError('Failed to load jobs. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  useEffect(() => {
    let result = [...jobs];

    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(job =>
        job.title.toLowerCase().includes(searchLower) ||
        job.company.toLowerCase().includes(searchLower) ||
        job.location.toLowerCase().includes(searchLower)
      );
    }

    if (filters.type) {
      result = result.filter(job => job.type === filters.type);
    }

    if (filters.location) {
      result = result.filter(job => 
        job.location.toLowerCase().includes(filters.location.toLowerCase())
      );
    }

    if (filters.certifiedOnly) {
      result = result.filter(job => 
        (job.verdict || '').toLowerCase() === 'certified'
      );
    }

    if (filters.sort === 'recent') {
      result.sort((a, b) => {
        const dateA = new Date(a.posted_at || a.postedAt || 0);
        const dateB = new Date(b.posted_at || b.postedAt || 0);
        return dateB - dateA;
      });
    } else if (filters.sort === 'score') {
      result.sort((a, b) => (b.verification_score || 0) - (a.verification_score || 0));
    } else if (filters.sort === 'company') {
      result.sort((a, b) => a.company.localeCompare(b.company));
    }

    setFilteredJobs(result);
  }, [filters, jobs]);

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const jobTypes = [...new Set(jobs.map(j => j.type))];
  const locations = [...new Set(jobs.map(j => j.location))];

  return (
    <div className="jobs-container">
      <div className="jobs-sidebar">
        <div className="jobs-filters">
          <h3 className="filters-title">Search & Filter</h3>
          
          <input
            type="text"
            placeholder="Search title, company, location..."
            value={filters.search}
            onChange={(e) => handleFilterChange('search', e.target.value)}
            className="jobs-search-input"
          />

          <div className="filter-group">
            <label>Job Type</label>
            <select 
              value={filters.type} 
              onChange={(e) => handleFilterChange('type', e.target.value)}
            >
              <option value="">All Types</option>
              {jobTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <select 
              value={filters.location} 
              onChange={(e) => handleFilterChange('location', e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map(loc => (
                <option key={loc} value={loc}>{loc}</option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select 
              value={filters.sort} 
              onChange={(e) => handleFilterChange('sort', e.target.value)}
            >
              <option value="recent">Most Recent</option>
              <option value="score">Highest Score</option>
              <option value="company">Company A-Z</option>
            </select>
          </div>

          <div className="filter-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={filters.certifiedOnly}
                onChange={(e) => handleFilterChange('certifiedOnly', e.target.checked)}
              />
              <span>Certified Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="jobs-main">
        <div className="jobs-header">
          <h2>{filteredJobs.length} Jobs Found</h2>
          <p className="jobs-subtitle">Showing verified opportunities</p>
        </div>

        {loading && <LoadingSkeleton count={5} />}
        
        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && filteredJobs.length === 0 && (
          <div className="empty-message">
            <p>No jobs match your criteria. Try adjusting your filters.</p>
          </div>
        )}

        <div className="jobs-list">
          {filteredJobs.map(job => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      </div>
    </div>
  );
}

export default Jobs;