const BASE = "/api";

export async function fetchJobs(params = {}) {
  const qs = new URLSearchParams(params).toString();
  const res = await fetch(`${BASE}/jobs?${qs}`);
  if (!res.ok) throw new Error("Failed to load jobs");
  return res.json();
}

export async function fetchJobById(id) {
  const res = await fetch(`${BASE}/jobs/${id}`);
  if (!res.ok) throw new Error("Failed to load job");
  return res.json();
}

export async function fetchSaved() {
  const res = await fetch(`${BASE}/saved`);
  if (!res.ok) throw new Error("Failed to load saved jobs");
  return res.json();
}

export async function saveJob(jobId) {
  const res = await fetch(`${BASE}/saved/${jobId}`, { method: "POST" });
  if (!res.ok) throw new Error("Failed to save job");
  return res.json();
}

export async function unsaveJob(jobId) {
  const res = await fetch(`${BASE}/saved/${jobId}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to unsave job");
  return res.json();
}
