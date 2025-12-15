// src/api/api.js
export const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000";

// default export MUST be a function
export default async function apiFetch(path, options = {}) {
  const token = localStorage.getItem("token");

  const res = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {}),
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const text = await res.text();
  let data = null;

  try {
    data = text ? JSON.parse(text) : null;
  } catch {
    data = text || null;
  }

  if (!res.ok) {
    const msg =
      (data && data.error) ||
      (data && data.message) ||
      (typeof data === "string" ? data : null) ||
      "Request failed";
    throw new Error(msg);
  }

  return data;
}
