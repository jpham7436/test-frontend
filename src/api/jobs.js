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
  const response = await fetch(`${API_BASE}/api/saved`);
  if (!response.ok) throw new Error("Failed to fetch saved jobs");
  return await response.json();
};

export const fetchSavedJobIds = async () => {
  const response = await fetch(`${API_BASE}/api/saved/ids`);
  if (!response.ok) throw new Error("Failed to fetch saved ids");
  return await response.json();
};

export const saveJob = async (id) => {
  const response = await fetch(`${API_BASE}/api/saved/${id}`, { method: "POST" });
  if (!response.ok) throw new Error("Failed to save job");
  return await response.json();
};

export const unsaveJob = async (id) => {
  const response = await fetch(`${API_BASE}/api/saved/${id}`, { method: "DELETE" });
  if (!response.ok) throw new Error("Failed to unsave job");
  return await response.json();
};
