import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

function Header({ user, onLogout }) {
  const navigate = useNavigate();
  const [showAIMenu, setShowAIMenu] = useState(false);

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
    } catch (err) {
      console.error('Logout error:', err);
    }
    onLogout();
    navigate('/login');
  };

  const aiFeatures = [
    { path: '/defect-classifier', label: 'Defect Classifier', icon: '🏷️' },
    { path: '/severity-scorer', label: 'Severity Scorer', icon: '📈' },
    { path: '/root-cause', label: 'Root Cause Analyzer', icon: '🔬' },
    { path: '/trend-tracker', label: 'Trend Tracker', icon: '📉' },
    { path: '/quality-inspector', label: 'Quality Inspector', icon: '✅' },
    { path: '/packaging-optimizer', label: 'Packaging Optimizer', icon: '📦' },
    { path: '/ai-analysis', label: 'Visual Analysis', icon: '📷' }
  ];

  return (
    <header className="header">
      <h1>
        <Link to="/" style={{ color: 'white', textDecoration: 'none' }}>
          🤖 AI Visual QA Inspector
        </Link>
      </h1>
      <nav className="header-nav">
        <Link to="/products">Products</Link>
        <Link to="/inspections">Inspections</Link>
        <Link to="/defects">Defects</Link>
        <div
          style={{ position: 'relative' }}
          onMouseEnter={() => setShowAIMenu(true)}
          onMouseLeave={() => setShowAIMenu(false)}
        >
          <span style={{
            cursor: 'pointer',
            padding: '0.5rem 1rem',
            borderRadius: '0.375rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.25rem'
          }}>
            AI Features ▾
          </span>
          {showAIMenu && (
            <div style={{
              position: 'absolute',
              top: '100%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'white',
              borderRadius: '0.5rem',
              boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
              padding: '0.5rem',
              minWidth: '220px',
              zIndex: 1000
            }}>
              {aiFeatures.map((feature) => (
                <Link
                  key={feature.path}
                  to={feature.path}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.75rem',
                    padding: '0.75rem 1rem',
                    color: '#1e293b',
                    textDecoration: 'none',
                    borderRadius: '0.375rem',
                    fontSize: '0.875rem'
                  }}
                  onMouseEnter={(e) => e.currentTarget.style.background = '#f1f5f9'}
                  onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}
                >
                  <span>{feature.icon}</span>
                  <span>{feature.label}</span>
                </Link>
              ))}
            </div>
          )}
        </div>
        <Link to="/reports">Reports</Link>
      </nav>
      <div className="user-info">
        <span>{user?.name || user?.email}</span>
        <button className="logout-btn" onClick={handleLogout}>
          Logout
        </button>
      </div>
    </header>
  );
}

export default Header;
