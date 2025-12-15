import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJobs } from "../api/jobs";
import { getUser } from "../utils/authStore";
import "./CompanyDashboard.css";

function normalize(v) {
  return String(v || "").toLowerCase().trim();
}

export default function CompanyDashboard() {
  const nav = useNavigate();
  const user = getUser();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [allJobs, setAllJobs] = useState([]);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        // Pull a chunk; enough to find "postedBy" jobs
        const data = await fetchJobs({ page: 1, limit: 500, certifiedOnly: false });

        if (!alive) return;
        setAllJobs(Array.isArray(data?.jobs) ? data.jobs : []);
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load company dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => (alive = false);
  }, []);

  const mine = useMemo(() => {
    const uid = user?.id || user?.userId; // depending on how you store user
    if (!uid) return [];

    return allJobs.filter((j) => String(j.postedBy || "") === String(uid));
  }, [allJobs, user]);

  const stats = useMemo(() => {
    const total = mine.length;
    const verified = mine.filter((j) => normalize(j.verdict) === "certified").length;
    const pending = mine.filter((j) => normalize(j.verdict) === "pending").length;

    const recent = [...mine]
      .sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0))
      .slice(0, 4);

    return { total, verified, pending, recent };
  }, [mine]);

  return (
    <div className="cdWrap">
      <div className="cdHeader">
        <div>
          <div className="cdKicker">COMPANY</div>
          <h1 className="cdTitle">{user?.name || "Company"} dashboard</h1>
          <p className="cdSub">Post jobs and track your listings (simple + believable).</p>
        </div>

        <div className="cdActions">
          <button className="btnPrimary" onClick={() => nav("/post")}>
            Post a job
          </button>
          <button className="btnGhost" onClick={() => nav("/jobs")}>
            View jobs feed
          </button>
        </div>
      </div>

      {loading ? (
        <div className="cdGrid">
          <div className="card skeleton" />
          <div className="card skeleton" />
          <div className="card skeleton" />
          <div className="card skeleton" />
          <div className="card skeletonTall" />
          <div className="card skeletonTall" />
        </div>
      ) : err ? (
        <div className="card errorCard">
          <div className="errorTitle">Couldn’t load company dashboard</div>
          <div className="errorMsg">{err}</div>
          <button className="btnPrimary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : (
        <div className="cdGrid">
          <div className="card">
            <div className="cardTop">
              <div className="cardLabel">Your postings</div>
              <span className="chip">Total</span>
            </div>
            <div className="metric">{stats.total}</div>
            <div className="muted">Jobs posted by your account.</div>
            <button className="linkBtn" onClick={() => nav("/post")}>Create another →</button>
          </div>

          <div className="card">
            <div className="cardTop">
              <div className="cardLabel">Verified</div>
              <span className="chip good">Quality</span>
            </div>
            <div className="metric">{stats.verified}</div>
            <div className="muted">Listings marked certified.</div>
          </div>

          <div className="card">
            <div className="cardTop">
              <div className="cardLabel">Pending</div>
              <span className="chip">Review</span>
            </div>
            <div className="metric">{stats.pending}</div>
            <div className="muted">Waiting to be verified.</div>
          </div>

          <div className="card">
            <div className="cardTop">
              <div className="cardLabel">Best practice</div>
              <span className="chip">Tip</span>
            </div>
            <div className="bigText">
              Always include an apply link
            </div>
            <div className="muted">
              Company careers page or Google Form increases clicks.
            </div>
          </div>

          <div className="card tall">
            <div className="cardTop">
              <div className="cardLabel">Your recent posts</div>
              <span className="chip">Latest</span>
            </div>

            {stats.recent.length === 0 ? (
              <div className="emptyState">
                No posts yet. Click “Post a job” to create your first listing.
              </div>
            ) : (
              <div className="list">
                {stats.recent.map((j) => (
                  <div className="listItem" key={j.id}>
                    <div>
                      <div className="listTitle">{j.title}</div>
                      <div className="listSub">
                        {j.location} • {j.type} • {String(j.verdict || "pending")}
                      </div>
                    </div>
                    <button className="btnMini" onClick={() => nav(`/jobs?search=${encodeURIComponent(j.company)}&page=1`)}>
                      View
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card tall">
            <div className="cardTop">
              <div className="cardLabel">Market view</div>
              <span className="chip">Preview</span>
            </div>

            <div className="muted" style={{ marginBottom: 10 }}>
              Quick snapshot of what candidates see.
            </div>

            <div className="miniGrid">
              {allJobs.slice(0, 6).map((j) => (
                <div className="miniJob" key={j.id}>
                  <div className="miniTitle">{j.title}</div>
                  <div className="miniSub">{j.company} • {j.location}</div>
                </div>
              ))}
            </div>

            <button className="linkBtn" onClick={() => nav("/jobs")}>Open feed →</button>
          </div>
        </div>
      )}
    </div>
  );
}
