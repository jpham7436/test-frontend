import React, { useMemo, useState } from "react";
import { getUser } from "../utils/authStore";
import "./Profile.css";

function keyForUser(userId) {
  return `profile_v2_${userId || "anon"}`;
}

export default function Profile() {
  const user = getUser();

  const initial = useMemo(() => {
    try {
      const raw = localStorage.getItem(keyForUser(user?.id));
      if (raw) return JSON.parse(raw);
    } catch {}
    return {
      headline: "CS Student • Entry-level roles • Open to internships",
      location: "San Diego, CA",
      about:
        "Computer Science student focused on building practical projects. Interested in internships and entry-level roles in software engineering.",
      skills: ["React", "Node.js", "SQL", "Git", "APIs"],
      links: {
        portfolio: "",
        github: "",
        linkedin: "",
      },
    };
  }, [user?.id]);

  const [form, setForm] = useState(initial);
  const [toast, setToast] = useState("");

  const save = () => {
    localStorage.setItem(keyForUser(user?.id), JSON.stringify(form));
    setToast("Saved ✓");
    setTimeout(() => setToast(""), 1200);
  };

  const updateSkill = (idx, value) => {
    setForm((f) => {
      const next = [...f.skills];
      next[idx] = value;
      return { ...f, skills: next };
    });
  };

  const addSkill = () => {
    setForm((f) => ({ ...f, skills: [...f.skills, ""] }));
  };

  const removeSkill = (idx) => {
    setForm((f) => ({ ...f, skills: f.skills.filter((_, i) => i !== idx) }));
  };

  return (
    <div className="profileWrap">
      <div className="profileTopRow">
        <div>
          <h1 className="pTitle">Profile</h1>
          <p className="pSub">Keep your profile clean so applying is faster.</p>
        </div>
        <button className="btn solid" onClick={save}>
          Save profile
        </button>
      </div>

      <div className="profileHeaderCard">
        <div className="avatar">{(user?.name || "U").slice(0, 1).toUpperCase()}</div>

        <div className="pHeadMain">
          <div className="pNameRow">
            <div className="pName">{user?.name || "User"}</div>
            <span className="pill">{user?.role || "user"}</span>
            {toast ? <span className="pill ok">{toast}</span> : null}
          </div>
          <div className="pEmail">{user?.email}</div>

          <div className="pMiniGrid">
            <div className="field">
              <label>Headline</label>
              <input
                value={form.headline}
                onChange={(e) => setForm((f) => ({ ...f, headline: e.target.value }))}
              />
            </div>

            <div className="field">
              <label>Location</label>
              <input
                value={form.location}
                onChange={(e) => setForm((f) => ({ ...f, location: e.target.value }))}
              />
            </div>
          </div>
        </div>
      </div>

      <div className="profileGrid">
        <div className="card">
          <div className="cardTop">
            <div>
              <div className="cardTitle">About</div>
              <div className="cardMeta">Short summary recruiters expect</div>
            </div>
          </div>
          <textarea
            className="textarea"
            value={form.about}
            onChange={(e) => setForm((f) => ({ ...f, about: e.target.value }))}
            rows={6}
          />
        </div>

        <div className="card">
          <div className="cardTop">
            <div>
              <div className="cardTitle">Skills</div>
              <div className="cardMeta">Keep it tight (5–10 max)</div>
            </div>
            <button className="miniBtn" onClick={addSkill} type="button">
              + Add
            </button>
          </div>

          <div className="skillsList">
            {form.skills.map((s, idx) => (
              <div className="skillRow" key={idx}>
                <input
                  value={s}
                  onChange={(e) => updateSkill(idx, e.target.value)}
                  placeholder="e.g. React"
                />
                <button className="xBtn" onClick={() => removeSkill(idx)} type="button">
                  ✕
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="card wide">
          <div className="cardTop">
            <div>
              <div className="cardTitle">Links</div>
              <div className="cardMeta">Optional — looks professional if filled</div>
            </div>
          </div>

          <div className="linksGrid">
            <div className="field">
              <label>Portfolio</label>
              <input
                value={form.links.portfolio}
                onChange={(e) =>
                  setForm((f) => ({ ...f, links: { ...f.links, portfolio: e.target.value } }))
                }
                placeholder="https://..."
              />
            </div>

            <div className="field">
              <label>GitHub</label>
              <input
                value={form.links.github}
                onChange={(e) =>
                  setForm((f) => ({ ...f, links: { ...f.links, github: e.target.value } }))
                }
                placeholder="https://github.com/..."
              />
            </div>

            <div className="field">
              <label>LinkedIn</label>
              <input
                value={form.links.linkedin}
                onChange={(e) =>
                  setForm((f) => ({ ...f, links: { ...f.links, linkedin: e.target.value } }))
                }
                placeholder="https://linkedin.com/in/..."
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
