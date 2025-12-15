// src/components/RequireCompany.jsx
import React from "react";
import { Navigate, useLocation } from "react-router-dom";
import { isAuthed, getUser } from "../utils/authStore";

export default function RequireCompany({ children }) {
  const location = useLocation();

  if (!isAuthed()) return <Navigate to="/login" replace state={{ from: location.pathname }} />;

  const user = getUser();
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (user.role !== "company") return <Navigate to="/dashboard" replace />;

  return children;
}
