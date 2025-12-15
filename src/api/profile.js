import { apiFetch } from "./client";

export async function fetchProfile() {
  return apiFetch("/api/profile");
}

export async function updateProfile(profile) {
  return apiFetch("/api/profile", {
    method: "PUT",
    body: JSON.stringify(profile),
  });
}
