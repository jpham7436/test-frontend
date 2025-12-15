import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { fetchJobs, fetchSavedJobs } from "../api/jobs";
import { getUser } from "../utils/authStore";
import "./Dashboard.css";

function percent(n, d) {
  if (!d) return 0;
  return Math.round((n / d) * 100);
}

export default function Dashboard() {
  const nav = useNavigate();
  const user = getUser();

  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const [saved, setSaved] = useState([]);
  const [jobTotal, setJobTotal] = useState(0);

  useEffect(() => {
    let alive = true;

    async function load() {
      try {
        setLoading(true);
        setErr("");

        // Keep this lightweight
        const [savedJobs, jobsMeta] = await Promise.all([
          fetchSavedJobs(),
          fetchJobs({ page: 1, limit: 1, certifiedOnly: false }),
        ]);

        if (!alive) return;

        setSaved(Array.isArray(savedJobs) ? savedJobs : []);
        setJobTotal(Number(jobsMeta?.total || 0));
      } catch (e) {
        if (!alive) return;
        setErr(e.message || "Failed to load dashboard");
      } finally {
        if (alive) setLoading(false);
      }
    }

    load();
    return () => {
      alive = false;
    };
  }, []);

  const stats = useMemo(() => {
    const savedCount = saved.length;

    const savedVerified = saved.filter(
      (j) => String(j.verdict || "").toLowerCase() === "certified"
    ).length;

    const hasApplyLink = saved.filter((j) => Boolean(j.apply_url)).length;

    // “Next actions” = simple, logical suggestions
    const nextAction =
      savedCount === 0
        ? "Save a few roles first so you can track them here."
        : hasApplyLink === 0
        ? "Open a saved job and use Apply to practice the flow."
        : "Pick 1–2 saved roles and apply (start with verified).";

    // Recently saved list (top 4)
    const recent = [...saved]
      .sort((a, b) => new Date(b.posted_at || 0) - new Date(a.posted_at || 0))
      .slice(0, 4);

    return {
      savedCount,
      savedVerified,
      savedVerifiedRate: percent(savedVerified, savedCount),
      hasApplyLink,
      jobTotal,
      nextAction,
      recent,
    };
  }, [saved, jobTotal]);

  return (
    <div className="dashWrap">
      <div className="dashHeader">
        <div>
          <div className="dashKicker">JOBHUNT</div>
          <h1 className="dashTitle">
            Welcome back, {user?.name || "User"} <span className="wave">👋</span>
          </h1>
          <p className="dashSub">
            A quick snapshot of your saved jobs and what to do next.
          </p>
        </div>

        <div className="dashActions">
          <button className="btnPrimary" onClick={() => nav("/jobs")}>
            Browse jobs
          </button>
          <button className="btnGhost" onClick={() => nav("/saved")}>
            View saved
          </button>
          <button className="btnGhost" onClick={() => nav("/profile")}>
            Profile
          </button>
        </div>
      </div>

      {loading ? (
        <div className="dashGrid">
          <div className="card skeleton" />
          <div className="card skeleton" />
          <div className="card skeleton" />
          <div className="card skeleton" />
          <div className="card skeletonTall" />
          <div className="card skeletonTall" />
        </div>
      ) : err ? (
        <div className="card errorCard">
          <div className="errorTitle">Couldn’t load dashboard</div>
          <div className="errorMsg">{err}</div>
          <button className="btnPrimary" onClick={() => window.location.reload()}>
            Retry
          </button>
        </div>
      ) : (
        <>
          <div className="dashGrid">
            <div className="card">
              <div className="cardTop">
                <div className="cardLabel">Saved jobs</div>
                <span className="chip">Bookmarks</span>
              </div>
              <div className="metric">{stats.savedCount}</div>
              <div className="muted">
                Jobs you saved to apply later.
              </div>
              <button className="linkBtn" onClick={() => nav("/saved")}>
                View saved →
              </button>
            </div>

            <div className="card">
              <div className="cardTop">
                <div className="cardLabel">Verified saved</div>
                <span className="chip good">Quality</span>
              </div>
              <div className="metric">{stats.savedVerifiedRate}%</div>
              <div className="muted">
                {stats.savedVerified} of {stats.savedCount} saved are verified.
              </div>
              <button className="linkBtn" onClick={() => nav("/jobs?certifiedOnly=true&page=1")}>
                Find verified roles →
              </button>
            </div>

            <div className="card">
              <div className="cardTop">
                <div className="cardLabel">Saved with apply link</div>
                <span className="chip">Ready</span>
              </div>
              <div className="metric">{stats.hasApplyLink}</div>
              <div className="muted">
                Saved jobs that include an apply URL.
              </div>
              <button className="linkBtn" onClick={() => nav("/saved")}>
                Open saved list →
              </button>
            </div>

            <div className="card">
              <div className="cardTop">
                <div className="cardLabel">Jobs in feed</div>
                <span className="chip">Market</span>
              </div>
              <div className="metric">{stats.jobTotal.toLocaleString()}</div>
              <div className="muted">
                Total roles available across the platform.
              </div>
              <button className="linkBtn" onClick={() => nav("/jobs")}>
                Explore jobs →
              </button>
            </div>

            <div className="card tall">
              <div className="cardTop">
                <div className="cardLabel">Next step</div>
                <span className="chip">Simple</span>
              </div>
              <div className="bigText">{stats.nextAction}</div>
              <div className="tipBox">
                Tip: save 3–5 roles, then apply to the top 1–2 verified ones.
              </div>
              <div className="row">
                <button className="btnPrimary" onClick={() => nav("/jobs")}>
                  Start searching
                </button>
                <button className="btnGhost" onClick={() => nav("/saved")}>
                  Review saved
                </button>
              </div>
            </div>

            <div className="card tall">
              <div className="cardTop">
                <div className="cardLabel">Recently saved</div>
                <span className="chip">Quick</span>
              </div>

              {stats.recent.length === 0 ? (
                <div className="emptyState">
                  No saved jobs yet. Save a few from the Jobs page and they’ll show here.
                </div>
              ) : (
                <div className="list">
                  {stats.recent.map((j) => (
                    <div className="listItem" key={j.id}>
                      <div>
                        <div className="listTitle">{j.title}</div>
                        <div className="listSub">
                          {j.company} • {j.location}
                        </div>
                      </div>
                      <button className="btnMini" onClick={() => nav(`/jobs?search=${encodeURIComponent(j.company)}&page=1`)}>
                        Open
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
