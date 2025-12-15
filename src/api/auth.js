// src/api/auth.js
import apiFetch from "./api";

export const login = async ({ email, password }) => {
  return await apiFetch("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password }),
  });
};

export const signup = async ({ name, email, password, role }) => {
  return await apiFetch("/api/auth/signup", {
    method: "POST",
    body: JSON.stringify({ name, email, password, role }),
  });
};

export const me = async () => {
  return await apiFetch("/api/auth/me");
};
