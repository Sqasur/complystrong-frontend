import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Wizard from './pages/Wizard';
import Results from './pages/Results';
import AdminDashboard from './pages/AdminDashboard';
import CookieConsent from './components/common/CookieConsent';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-50 font-sans text-slate-900 antialiased">
        <Routes>
          {}
          <Route path="/" element={<Home />} />

          {}
          <Route path="/wizard" element={<Wizard />} />

          {}
          <Route path="/results" element={<Results />} />

          {}
          <Route path="/admin" element={<AdminDashboard />} />
        </Routes>
        <CookieConsent />
      </div>
    </Router>
  );
}

export default App;