// src/App.jsx
// Point d'entree du routeur React et verification du token JWT partenaire

import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';
import { isTokenExpired } from './utils/jwt';

function App() {
  const rawToken = localStorage.getItem('partner_token');
  const tokenValide = rawToken && !isTokenExpired(rawToken) ? rawToken : null;

  if (rawToken && !tokenValide) {
    localStorage.removeItem('partner_token');
    localStorage.removeItem('partner_data');
  }

  return (
    <Router>
      <Routes>
        <Route path="/login" element={!tokenValide ? <Auth /> : <Navigate to="/dashboard" />} />
        <Route path="/dashboard" element={tokenValide ? <Dashboard /> : <Navigate to="/login" />} />
        <Route path="*" element={<Navigate to={tokenValide ? '/dashboard' : '/login'} />} />
      </Routes>
    </Router>
  );
}

export default App;
