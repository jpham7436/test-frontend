import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";

import Navbar from "./components/Navbar";
import Home from "./pages/HomePage";
import Jobs from "./pages/Jobs";
import JobDetails from "./pages/JobDetails";
import Saved from "./pages/Saved";
import PostJob from "./pages/PostJob";

import "./App.css";

function App() {
  return (
    <Router>
      <div className="App">
        <Navbar />

        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/jobs/:id" element={<JobDetails />} />
          <Route path="/saved" element={<Saved />} />

          {/* NEW: job posting page */}
          <Route path="/post" element={<PostJob />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
