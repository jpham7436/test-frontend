// src/api/jobs.js
import { getToken } from "../utils/authStore";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// Jobs list (paginated)
export const fetchJobs = async (params = {}) => {
  const queryString = new URLSearchParams(params).toString();
  const url = `${API_BASE}/api/jobs${queryString ? `?${queryString}` : ""}`;

  const response = await fetch(url);
  if (!response.ok) throw new Error("Failed to fetch jobs");
  return await response.json(); // { total, limit, page, totalPages, jobs: [] }
};

export const fetchJobById = async (id) => {
  const response = await fetch(`${API_BASE}/api/jobs/${id}`);
  if (!response.ok) throw new Error("Failed to fetch job");
  return await response.json();
};

// Saved (backend persisted)
export const fetchSavedJobs = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/saved`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch saved jobs");
  return await response.json();
};

export const fetchSavedJobIds = async () => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/saved/ids`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to fetch saved job ids");
  return await response.json(); // [id, id, ...]
};

export const saveJob = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/saved/${id}`, {
    method: "POST",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to save job");
  return await response.json(); // { ok, savedIds }
};

export const unsaveJob = async (id) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/saved/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!response.ok) throw new Error("Failed to unsave job");
  return await response.json(); // { ok, savedIds }
};

// ✅ Company: Post a job (AUTH REQUIRED)
export const postJob = async (payload) => {
  const token = getToken();
  const response = await fetch(`${API_BASE}/api/jobs`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });

  // If backend returns HTML (proxy issues) or plain text, guard it
  const text = await response.text();
  let data;
  try {
    data = JSON.parse(text);
  } catch {
    data = { error: text };
  }

  if (!response.ok) {
    throw new Error(data?.error || "Failed to post job");
  }
  return data; // { ok: true, job }
};
