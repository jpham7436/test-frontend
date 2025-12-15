import React, { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { postJob } from "../api/jobs";
import { getUser } from "../utils/authStore";
import "./PostJob.css";

export default function PostJob() {
  const nav = useNavigate();
  const user = getUser();

  const isCompany = useMemo(() => String(user?.role || "").toLowerCase() === "company", [user]);

  const [form, setForm] = useState({
    title: "",
    company: user?.name || "",
    location: "",
    type: "Full-time",
    salary: "",
    availability: "",
    source_urls: "",
    source_names: "",
  });

  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState("");
  const [ok, setOk] = useState("");

  const set = (k) => (e) => setForm((p) => ({ ...p, [k]: e.target.value }));

  const onSubmit = async (e) => {
    e.preventDefault();
    setErr("");
    setOk("");

    if (!isCompany) {
      setErr("Only company accounts can post jobs.");
      return;
    }

    if (!form.title || !form.company || !form.location || !form.salary) {
      setErr("Please fill: Job title, Company, Location, Salary.");
      return;
    }

    const source_urls = form.source_urls
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    const source_names = form.source_names
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);

    try {
      setSaving(true);
      await postJob({
        title: form.title,
        company: form.company,
        location: form.location,
        type: form.type,
        salary: form.salary,
        availability: form.availability,
        source_urls,
        source_names,
      });

      setOk("Job posted! It should appear in the feed.");
      setTimeout(() => nav("/company"), 650);
    } catch (e2) {
      setErr(e2.message || "Failed to post job");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="pjWrap">
      <div className="pjHeader">
        <div>
          <div className="pjKicker">COMPANY</div>
          <h1 className="pjTitle">Post a job</h1>
          <p className="pjSub">Create a listing that shows up in the Jobs feed.</p>
        </div>

        <div className="pjActions">
          <button className="btnGhost" onClick={() => nav("/company")} type="button">
            Back to dashboard
          </button>
          <button className="btnPrimary" onClick={() => nav("/jobs")} type="button">
            View feed
          </button>
        </div>
      </div>

      {!isCompany && (
        <div className="alert warn">
          You’re logged in as a <b>{user?.role || "user"}</b>. Switch to a company account to post jobs.
        </div>
      )}

      {err && <div className="alert error">{err}</div>}
      {ok && <div className="alert ok">{ok}</div>}

      <form className="pjCard" onSubmit={onSubmit}>
        <div className="grid">
          <div className="field">
            <label>Job title *</label>
            <input value={form.title} onChange={set("title")} placeholder="e.g., Junior Software Engineer" />
          </div>

          <div className="field">
            <label>Company *</label>
            <input value={form.company} onChange={set("company")} placeholder="e.g., SDSU" />
          </div>

          <div className="field">
            <label>Location *</label>
            <input value={form.location} onChange={set("location")} placeholder="e.g., San Diego, CA (Hybrid)" />
          </div>

          <div className="field">
            <label>Job type</label>
            <select value={form.type} onChange={set("type")}>
              <option>Full-time</option>
              <option>Part-time</option>
              <option>Contract</option>
              <option>Internship</option>
            </select>
          </div>

          <div className="field">
            <label>Salary *</label>
            <input value={form.salary} onChange={set("salary")} placeholder="e.g., $80k–$115k or $25/hr" />
          </div>

          <div className="field">
            <label>Availability</label>
            <input value={form.availability} onChange={set("availability")} placeholder="e.g., ASAP / Spring / Summer" />
          </div>

          <div className="field full">
            <label>Source URLs</label>
            <input
              value={form.source_urls}
              onChange={set("source_urls")}
              placeholder="Comma separated, e.g., company.com/careers, linkedin.com/jobs/..."
            />
          </div>

          <div className="field full">
            <label>Source names</label>
            <input value={form.source_names} onChange={set("source_names")} placeholder="Comma separated, e.g., Company Site, LinkedIn" />
          </div>
        </div>

        <div className="pjFooter">
          <div className="hint">Fields marked * are required.</div>
          <div className="row">
            <button className="btnPrimary" disabled={!isCompany || saving} type="submit">
              {saving ? "Posting..." : "Post job"}
            </button>
            <button
              className="btnGhost"
              type="button"
              onClick={() =>
                setForm({
                  title: "",
                  company: user?.name || "",
                  location: "",
                  type: "Full-time",
                  salary: "",
                  availability: "",
                  source_urls: "",
                  source_names: "",
                })
              }
            >
              Clear
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
