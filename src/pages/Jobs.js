import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchJobs, fetchSavedJobIds, saveJob, unsaveJob } from "../api/jobs";
import JobCard from "../components/JobCard";
import LoadingSkeleton from "../components/LoadingSkeleton";
import "./Jobs.css";

function buildFallbackApply(company) {
  const q = encodeURIComponent(`${company || "company"} careers`);
  return `https://www.google.com/search?q=${q}`;
}

function Jobs() {
  const [searchParams] = useSearchParams();

  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);

  const [savedIds, setSavedIds] = useState(new Set());

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // pagination
  const [page, setPage] = useState(1);
  const [limit] = useState(25);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);

  const [filters, setFilters] = useState({
    search: searchParams.get("search") || "",
    type: "",
    location: "",
    certifiedOnly: false,
    sort: "recent",
  });

  const load = async () => {
    try {
      setLoading(true);
      setError(null);

      const [jobsResp, saved] = await Promise.all([
        fetchJobs({
          search: filters.search || "",
          type: filters.type || "",
          location: filters.location || "",
          certifiedOnly: String(filters.certifiedOnly),
          sort: filters.sort || "recent",
          page: String(page),
          limit: String(limit),
        }),
        fetchSavedJobIds(),
      ]);

      const safeSaved = Array.isArray(saved) ? saved : [];
      setSavedIds(new Set(safeSaved.map(String)));

      const list = Array.isArray(jobsResp) ? jobsResp : jobsResp?.jobs || [];
      setJobs(list);

      setTotal(Number(jobsResp?.total || list.length || 0));
      setTotalPages(Number(jobsResp?.totalPages || 1));

      if (list.length) {
        const firstId = list[0].id;
        setSelectedJobId((prev) => prev || firstId);
      } else {
        setSelectedJobId(null);
      }
    } catch (e) {
      setError("Failed to load jobs. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    page,
    limit,
    filters.search,
    filters.type,
    filters.location,
    filters.certifiedOnly,
    filters.sort,
  ]);

  const handleFilterChange = (key, value) => {
    setPage(1);
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const toggleSave = async (jobId) => {
    const id = String(jobId);
    const currentlySaved = savedIds.has(id);

    // optimistic UI
    setSavedIds((prev) => {
      const next = new Set(prev);
      if (currentlySaved) next.delete(id);
      else next.add(id);
      return next;
    });

    try {
      if (currentlySaved) await unsaveJob(id);
      else await saveJob(id);
    } catch {
      // revert
      setSavedIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) next.add(id);
        else next.delete(id);
        return next;
      });
    }
  };

  const selectedJob = useMemo(() => {
    if (!selectedJobId) return null;
    return jobs.find((j) => String(j.id) === String(selectedJobId)) || null;
  }, [jobs, selectedJobId]);

  const selectedIsSaved = selectedJob ? savedIds.has(String(selectedJob.id)) : false;

  // ✅ Apply URL (real link)
  const applyHref = useMemo(() => {
    if (!selectedJob) return "";
    const raw = selectedJob.apply_url || selectedJob.applyUrl || selectedJob.url || "";
    return raw ? raw : buildFallbackApply(selectedJob.company);
  }, [selectedJob]);

  const jobTypes = useMemo(
    () => [...new Set(jobs.map((j) => j.type).filter(Boolean))],
    [jobs]
  );
  const locations = useMemo(
    () => [...new Set(jobs.map((j) => j.location).filter(Boolean))],
    [jobs]
  );

  const pageNumbers = useMemo(() => {
    const maxButtons = 7;
    const pages = [];
    const tp = totalPages;

    if (tp <= maxButtons) {
      for (let p = 1; p <= tp; p++) pages.push(p);
      return pages;
    }

    const left = Math.max(1, page - 2);
    const right = Math.min(tp, page + 2);

    pages.push(1);
    if (left > 2) pages.push("...");

    for (let p = left; p <= right; p++) {
      if (p !== 1 && p !== tp) pages.push(p);
    }

    if (right < tp - 1) pages.push("...");
    pages.push(tp);

    return pages;
  }, [page, totalPages]);

  return (
    <div className="jobs-container">
      <div className="jobs-sidebar">
        <div className="jobs-filters">
          <h3 className="filters-title">Search & Filter</h3>

          <input
            type="text"
            placeholder="Search title, company, location..."
            value={filters.search}
            onChange={(e) => handleFilterChange("search", e.target.value)}
            className="jobs-search-input"
          />

          <div className="filter-group">
            <label>Job Type</label>
            <select
              value={filters.type}
              onChange={(e) => handleFilterChange("type", e.target.value)}
            >
              <option value="">All Types</option>
              {jobTypes.map((t) => (
                <option key={t} value={t}>
                  {t}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Location</label>
            <select
              value={filters.location}
              onChange={(e) => handleFilterChange("location", e.target.value)}
            >
              <option value="">All Locations</option>
              {locations.map((loc) => (
                <option key={loc} value={loc}>
                  {loc}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Sort By</label>
            <select
              value={filters.sort}
              onChange={(e) => handleFilterChange("sort", e.target.value)}
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
                onChange={(e) => handleFilterChange("certifiedOnly", e.target.checked)}
              />
              <span>Certified Only</span>
            </label>
          </div>
        </div>
      </div>

      <div className="jobs-main">
        <div className="jobs-header">
          <h2>Jobs ({total.toLocaleString()})</h2>
          <p className="jobs-subtitle">
            Page {page} of {totalPages} • Showing {limit} per page
          </p>
        </div>

        {loading && <LoadingSkeleton count={5} />}

        {error && (
          <div className="error-message">
            <p>{error}</p>
          </div>
        )}

        {!loading && jobs.length === 0 && (
          <div className="empty-message">
            <p>No jobs match your criteria. Try adjusting your filters.</p>
          </div>
        )}

        {!loading && jobs.length > 0 && (
          <>
            <div className="jobs-grid">
              <div className="jobs-list">
                {jobs.map((job) => (
                  <JobCard
                    key={job.id}
                    job={job}
                    selected={String(job.id) === String(selectedJobId)}
                    onSelect={setSelectedJobId}
                    isSaved={savedIds.has(String(job.id))}
                    onToggleSave={toggleSave}
                  />
                ))}
              </div>

              <div className="job-detail">
                {selectedJob ? (
                  <div className="job-detail__card">
                    <div className="job-detail__head">
                      <div className="job-detail__logo" aria-hidden="true">
                        {(selectedJob.company || "J")[0]?.toUpperCase()}
                      </div>
                      <div className="job-detail__headText">
                        <div className="job-detail__title">
                          {selectedJob.title || "Untitled Role"}
                        </div>
                        <div className="job-detail__meta">
                          <span className="job-detail__company">
                            {selectedJob.company || "Unknown Company"}
                          </span>
                          <span className="job-detail__dot">•</span>
                          <span>{selectedJob.location || "Location not listed"}</span>
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
                        Apply
                      </a>

                      <button
                        className="btn btn--ghost"
                        type="button"
                        onClick={() => toggleSave(selectedJob.id)}
                      >
                        {selectedIsSaved ? "Saved ★" : "Save"}
                      </button>
                    </div>

                    <div className="job-detail__section">
                      <div className="job-detail__sectionTitle">About the role</div>
                      <div className="job-detail__desc">
                        {selectedJob.description || "No description provided."}
                      </div>
                    </div>

                    <div className="job-detail__section">
                      <div className="job-detail__sectionTitle">Details</div>
                      <div className="job-detail__kv">
                        <div className="job-detail__k">Type</div>
                        <div className="job-detail__v">{selectedJob.type || "—"}</div>

                        <div className="job-detail__k">Salary</div>
                        <div className="job-detail__v">{selectedJob.salary || "—"}</div>

                        <div className="job-detail__k">Verdict</div>
                        <div className="job-detail__v">{selectedJob.verdict || "—"}</div>

                        <div className="job-detail__k">Score</div>
                        <div className="job-detail__v">
                          {selectedJob.verification_score ?? "—"}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="job-detail__empty">Select a job to preview details.</div>
                )}
              </div>
            </div>

            <div className="pagination">
              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Prev
              </button>

              {pageNumbers.map((p, idx) =>
                p === "..." ? (
                  <span key={`dots-${idx}`} className="page-dots">
                    …
                  </span>
                ) : (
                  <button
                    key={p}
                    className={`page-btn ${p === page ? "page-btn--active" : ""}`}
                    onClick={() => setPage(p)}
                  >
                    {p}
                  </button>
                )
              )}

              <button
                className="page-btn"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Next
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default Jobs;
