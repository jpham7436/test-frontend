// src/pages/Jobs.jsx
import React, { useEffect, useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { fetchJobs, fetchSavedJobIds, saveJob, unsaveJob } from "../api/jobs";
import LoadingSkeleton from "../components/LoadingSkeleton";
import "./Jobs.css";

export default function Jobs() {
  const [searchParams, setSearchParams] = useSearchParams();

  const urlSearch = searchParams.get("search") || "";
  const urlPage = parseInt(searchParams.get("page") || "1", 10);
  const urlLimit = parseInt(searchParams.get("limit") || "25", 10);
  const urlSort = searchParams.get("sort") || "recent";

  const [filters, setFilters] = useState({
    search: urlSearch,
    type: "",
    location: "",
    certifiedOnly: true,
    sort: urlSort,
  });

  const [jobs, setJobs] = useState([]);
  const [selected, setSelected] = useState(null);

  const [page, setPage] = useState(Number.isNaN(urlPage) ? 1 : urlPage);
  const [limit, setLimit] = useState(Number.isNaN(urlLimit) ? 25 : urlLimit);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  const [savedIds, setSavedIds] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");

  // keep local state in sync when URL changes (navbar search)
  useEffect(() => {
    setFilters((p) => ({ ...p, search: urlSearch, sort: urlSort }));
    setPage(Number.isNaN(urlPage) ? 1 : urlPage);
    setLimit(Number.isNaN(urlLimit) ? 25 : urlLimit);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlSearch, urlPage, urlLimit, urlSort]);

  useEffect(() => {
    (async () => {
      try {
        const ids = await fetchSavedJobIds();
        setSavedIds(new Set(ids.map(String)));
      } catch {
        // ignore
      }
    })();
  }, []);

  useEffect(() => {
    const load = async () => {
      try {
        setLoading(true);
        setErr("");

        const data = await fetchJobs({
          search: filters.search || "",
          type: filters.type || "",
          location: filters.location || "",
          certifiedOnly: String(filters.certifiedOnly),
          sort: filters.sort || "recent",
          page,
          limit,
        });

        setJobs(data.jobs || []);
        setTotal(data.total || 0);
        setTotalPages(data.totalPages || 1);

        // keep a selection
        if (data.jobs?.length) {
          setSelected((prev) => {
            if (!prev) return data.jobs[0];
            const stillThere = data.jobs.find((j) => String(j.id) === String(prev.id));
            return stillThere || data.jobs[0];
          });
        } else {
          setSelected(null);
        }
      } catch (e) {
        setErr(e.message || "Failed to load jobs");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, [filters, page, limit]);

  const onSubmit = (e) => {
    e.preventDefault();
    // push into URL so navbar + refresh stays consistent
    setSearchParams({
      search: filters.search || "",
      page: "1",
      limit: String(limit),
      sort: filters.sort || "recent",
    });
  };

  const onClear = () => {
    setFilters((p) => ({ ...p, search: "", type: "", location: "", certifiedOnly: true, sort: "recent" }));
    setSearchParams({ search: "", page: "1", limit: String(limit), sort: "recent" });
  };

  const toggleSave = async (jobId) => {
    const id = String(jobId);
    const next = new Set(savedIds);

    try {
      if (next.has(id)) {
        await unsaveJob(id);
        next.delete(id);
      } else {
        await saveJob(id);
        next.add(id);
      }
      setSavedIds(next);
    } catch {
      // ignore
    }
  };

  const applyToJob = (job) => {
    const url = job?.apply_url || (Array.isArray(job?.source_urls) && job.source_urls[0]) || "";
    if (!url) return alert("No apply link for this job.");
    window.open(url, "_blank", "noopener,noreferrer");
  };

  const pageLabel = useMemo(() => {
    const start = total === 0 ? 0 : (page - 1) * limit + 1;
    const end = Math.min(total, page * limit);
    return `${start}-${end} of ${total}`;
  }, [page, limit, total]);

  return (
    <div className="jobsPage">
      <div className="jobsTop">
        <div className="jobsTitle">
          <h1>Find jobs</h1>
          <p>{total.toLocaleString()} jobs available</p>
        </div>

        <div className="jobsControls">
          <select value={filters.sort} onChange={(e) => setFilters((p) => ({ ...p, sort: e.target.value }))}>
            <option value="recent">Most recent</option>
            <option value="score">Highest verified</option>
            <option value="company">Company A–Z</option>
          </select>

          <select
            value={limit}
            onChange={(e) => {
              const v = parseInt(e.target.value, 10);
              setLimit(v);
              setSearchParams({
                search: filters.search || "",
                page: "1",
                limit: String(v),
                sort: filters.sort || "recent",
              });
            }}
          >
            <option value={25}>25 / page</option>
            <option value={50}>50 / page</option>
            <option value={100}>100 / page</option>
          </select>
        </div>
      </div>

      <div className="jobsGrid">
        <div className="filtersCard">
          <h3>Search &amp; Filters</h3>

          <form className="filterForm" onSubmit={onSubmit}>
            <label>
              Keywords
              <input
                value={filters.search}
                onChange={(e) => setFilters((p) => ({ ...p, search: e.target.value }))}
                placeholder="title, company, keywords..."
              />
            </label>

            <label>
              Job type
              <select value={filters.type} onChange={(e) => setFilters((p) => ({ ...p, type: e.target.value }))}>
                <option value="">All</option>
                <option value="Internship">Internship</option>
                <option value="Full-time">Full-time</option>
                <option value="Part-time">Part-time</option>
                <option value="Contract">Contract</option>
              </select>
            </label>

            <label>
              Location (city/state/country)
              <input
                value={filters.location}
                onChange={(e) => setFilters((p) => ({ ...p, location: e.target.value }))}
                placeholder="e.g. San Diego, CA"
              />
            </label>

            <label className="checkRow">
              <input
                type="checkbox"
                checked={filters.certifiedOnly}
                onChange={(e) => setFilters((p) => ({ ...p, certifiedOnly: e.target.checked }))}
              />
              Verified only
            </label>

            <button className="primaryBtn" type="submit">Search</button>
            <button className="ghostBtn" type="button" onClick={onClear}>Clear</button>
          </form>
        </div>

        <div className="resultsCard">
          <div className="resultsHeader">
            <div>
              <div className="resultsH">Results</div>
              <div className="resultsS">Page {page} / {totalPages} • {pageLabel}</div>
            </div>

            <div className="pager">
              <button disabled={page <= 1} onClick={() => setSearchParams({
                search: filters.search || "",
                page: String(page - 1),
                limit: String(limit),
                sort: filters.sort || "recent",
              })}>
                Prev
              </button>
              <button disabled={page >= totalPages} onClick={() => setSearchParams({
                search: filters.search || "",
                page: String(page + 1),
                limit: String(limit),
                sort: filters.sort || "recent",
              })}>
                Next
              </button>
            </div>
          </div>

          {err && <div className="errorBox">{err}</div>}

          {loading ? (
            <div className="skeletonList">
              <div className="skItem" />
              <div className="skItem" />
              <div className="skItem" />
            </div>
          ) : (
            <div className="jobList">
              {jobs.map((j) => {
                const active = selected && String(selected.id) === String(j.id);
                const saved = savedIds.has(String(j.id));
                return (
                  <div
                    key={j.id}
                    className={`jobRow ${active ? "active" : ""}`}
                    onClick={() => setSelected(j)}
                  >
                    <div className="jobRowTop">
                      <div className="jobTitle">{j.title}</div>
                      <div className="jobBadges">
                        <span className={`badge ${j.verdict === "certified" ? "verified" : "pending"}`}>
                          {j.verdict === "certified" ? "VERIFIED" : "STANDARD"}
                        </span>
                        {j.easyApply && <span className="badge easy">EASY APPLY</span>}
                      </div>
                    </div>

                    <div className="jobMeta">
                      {j.company} <span className="dotSep">•</span> {j.location}
                    </div>
                    <div className="jobMeta2">
                      {j.type} <span className="dotSep">•</span> {j.salary}{" "}
                      <span className="dotSep">•</span> {j.verification_score || 0}% verified
                    </div>

                    <div className="jobRowActions">
                      <button
                        className={`saveBtn ${saved ? "saved" : ""}`}
                        onClick={(e) => {
                          e.stopPropagation();
                          toggleSave(j.id);
                        }}
                      >
                        {saved ? "Saved" : "Save"}
                      </button>

                      <button
                        className="applyBtn"
                        onClick={(e) => {
                          e.stopPropagation();
                          applyToJob(j);
                        }}
                      >
                        Apply
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="detailsCard">
          {!selected ? (
            <div className="emptyBox">Select a job to see details.</div>
          ) : (
            <>
              <div className="detailsTop">
                <div className="detailsTitle">{selected.title}</div>
                <div className="detailsCompany">{selected.company}</div>
                <div className="detailsLoc">{selected.location}</div>
              </div>

              <div className="detailsChips">
                <span className="chip">{selected.type}</span>
                <span className="chip">{selected.salary}</span>
                <span className="chip">{selected.verification_score || 0}% verified</span>
              </div>

              <div className="detailsDesc">
                <h4>About this role</h4>
                <pre>{selected.description}</pre>
              </div>

              <div className="detailsFooter">
                <button className="applyBig" onClick={() => applyToJob(selected)}>
                  Apply now
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
