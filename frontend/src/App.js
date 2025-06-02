import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import ProductList from './components/ProductList';
import SuccessPage from './components/SuccessPage';
import FailurePage from './components/FailurePage';
import PendingPage from './components/PendingPage';
import AuthModal from './components/AuthModal';
import OrderHistory from './components/OrderHistory';
import './App.css';

function App() {
  const [authOpen, setAuthOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [showHistory, setShowHistory] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('user');
    if (saved) setUser(JSON.parse(saved));
  }, []);

  const handleAuthSuccess = userObj => {
    setUser(userObj);
    localStorage.setItem('user', JSON.stringify(userObj));
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
  };

  return (
    <Router>
      <div className="App">
        <div style={{ position: 'fixed', top: 18, right: 24, zIndex: 10000 }}>
          <button
            className="user-btn-fixed"
            onClick={() => setAuthOpen(true)}
            style={{ background: '#fff', border: '1px solid #8ecae6', borderRadius: 22, padding: '8px 18px', fontWeight: 600, color: '#219ebc', boxShadow: '0 2px 8px #0001', cursor: 'pointer', marginRight: 8 }}
          >
            {user ? (
              <>
                <span style={{marginRight: 8}}>👤 {user.username}</span>
                <span onClick={e => { e.stopPropagation(); handleLogout(); }} style={{color:'#e57373', marginLeft:8, cursor:'pointer', fontSize:'1.1em'}}>Salir</span>
              </>
            ) : (
              <>👤 Ingresar / Crear cuenta</>
            )}
          </button>
          {user && (
            <button
              onClick={() => setShowHistory(true)}
              style={{ background: '#8ecae6', color: '#fff', border: 'none', borderRadius: 22, padding: '8px 14px', fontWeight: 600, marginLeft: 0, fontSize: '0.98em', cursor: 'pointer' }}
            >
              🛒 Mis compras
            </button>
          )}
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} onAuthSuccess={handleAuthSuccess} />
        {showHistory && (
          <div className="auth-modal-overlay" style={{zIndex: 9999}}>
            <div className="auth-modal order-history-modal">
              <button className="auth-close" onClick={() => setShowHistory(false)}>×</button>
              <OrderHistory user={user} />
            </div>
          </div>
        )}
        <Routes>
          <Route path="/" element={<ProductList user={user} />} />
          <Route path="/success" element={<SuccessPage />} />
          <Route path="/failure" element={<FailurePage />} />
          <Route path="/pending" element={<PendingPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
