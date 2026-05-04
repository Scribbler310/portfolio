import { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import LandingPage from './pages/LandingPage';
import Dashboard from './pages/Dashboard';

function App() {
  const [riskProfile, setRiskProfile] = useState(() => {
    return localStorage.getItem('gs_risk_profile') || null;
  });

  const handleSetRiskProfile = (profile) => {
    setRiskProfile(profile);
    localStorage.setItem('gs_risk_profile', profile);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gs-light text-gs-navy font-sans">
        <Routes>
          <Route 
            path="/" 
            element={<LandingPage setRiskProfile={handleSetRiskProfile} />} 
          />
          <Route 
            path="/dashboard" 
            element={riskProfile ? <Dashboard riskProfile={riskProfile} /> : <Navigate to="/" />} 
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
