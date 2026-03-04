import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Wizard from './pages/Wizard';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';

/**
 * Main Application Component.
 * Sets up routing for the Audit Readiness Tool.
 */
function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <Routes>
          {/* Landing Page */}
          <Route path="/" element={<Home />} />

          {/* Multi-step Assessment Wizard */}
          <Route path="/wizard" element={<Wizard />} />

          {/* Detailed Assessment Results */}
          <Route path="/results" element={<Results />} />

          {/* Admin Dashboard */}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
