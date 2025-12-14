import React from "react";
import { NavLink } from "react-router-dom";

export default function NavBar() {
  return (
    <header className="nav">
      <div className="nav__inner">
        <div className="nav__brand">JobHunt</div>

        <nav className="nav__links">
          <NavLink to="/" className={({ isActive }) => (isActive ? "nav__link active" : "nav__link")}>
            Home
          </NavLink>
          <NavLink to="/jobs" className={({ isActive }) => (isActive ? "nav__link active" : "nav__link")}>
            Jobs
          </NavLink>
        </nav>
      </div>
    </header>
  );
}
