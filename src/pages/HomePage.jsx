import React, { useState, useEffect } from "react";
import { fetchJobs } from "../api/jobs";
import JobCard from "../components/JobCard";
import Sidebar from "../components/Sidebar";
import LoadingSkeleton from "../components/LoadingSkeleton";
import "./Home.css";

function Home() {
  const [jobs, setJobs] = useState([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [page, setPage] = useState(1);
  const jobsPerPage = 10;

  useEffect(() => {
    const loadJobs = async () => {
      try {
        setLoading(true);
        setError(null);

        // pull page 1 from backend (paginated)
        const resp = await fetchJobs({ page: "1", limit: "50", sort: "recent" });

        const list = Array.isArray(resp) ? resp : resp?.jobs || [];
        setJobs(list);

        // total from backend if present
        setTotal(Number(resp?.total ?? list.length ?? 0));
      } catch (err) {
        setError("Failed to load jobs. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    loadJobs();
  }, []);

  const paginatedJobs = jobs.slice(0, page * jobsPerPage);
  const hasMore = paginatedJobs.length < jobs.length;

  return (
    <div className="home-container">
      <Sidebar type="left" />

      <main className="home-main">
        <div className="home-hero">
          <h1>Find Real Jobs, Fast</h1>
          <p>JobHunting offers verified job postings with no fake listings. Better than LinkedIn.</p>
        </div>

        <div className="home-header">
          <h2>Latest Opportunities</h2>
          <p className="home-subtitle">
            {total.toLocaleString()} jobs available
          </p>
        </div>

        {loading && <LoadingSkeleton count={5} />}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && !error && jobs.length === 0 && (
          <div className="empty-message">
            <p>No jobs available at the moment. Check back later!</p>
          </div>
        )}

        <div className="jobs-feed">
          {paginatedJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>

        {!loading && hasMore && (
          <button className="load-more-btn" onClick={() => setPage((prev) => prev + 1)}>
            Load More Jobs
          </button>
        )}
      </main>

      <Sidebar type="right" />
    </div>
  );
}

export default Home;
