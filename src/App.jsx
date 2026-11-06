import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Auth from './Auth';
import Dashboard from './Dashboard';

const decodeToken = (t) => {
  if (!t || !t.includes('.')) return null;
  try {
    const base64Url = t.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const padding = '='.repeat((4 - base64.length % 4) % 4);
    return JSON.parse(atob(base64 + padding));
  } catch (e) {
    return null;
  }
};

const isTokenExpired = (t) => {
  if (!t) return true;
  const decoded = decodeToken(t);
  if (!decoded) return true;
  if (!decoded.exp) return false;
  return decoded.exp * 1000 <= Date.now();
};

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
        <Route path="*" element={<Navigate to={tokenValide ? "/dashboard" : "/login"} />} />
      </Routes>
    </Router>
  );
}

export default App;
