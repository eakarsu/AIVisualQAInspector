import React, { useState } from 'react';
import axios from 'axios';

function Login({ onLogin }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleAutoFill = () => {
    setEmail('demo@example.com');
    setPassword('password123');
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/auth/login', { email, password });
      if (response.data.success) {
        onLogin(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Left Panel - Branding */}
      <div className="login-left">
        <div className="login-brand">
          <div className="login-brand-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7z"/>
              <circle cx="12" cy="12" r="3"/>
            </svg>
          </div>
          <h1>AI Visual QA Inspector</h1>
          <p>Intelligent manufacturing quality management powered by AI</p>
        </div>

        <div className="login-features">
          <div className="login-feature-item">
            <div className="login-feature-check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span>AI-powered defect detection & classification</span>
          </div>
          <div className="login-feature-item">
            <div className="login-feature-check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span>Real-time quality trend analysis</span>
          </div>
          <div className="login-feature-item">
            <div className="login-feature-check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span>Root cause analysis with 5 Whys & Fishbone</span>
          </div>
          <div className="login-feature-item">
            <div className="login-feature-check">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <span>Visual inspection with image analysis</span>
          </div>
        </div>
      </div>

      {/* Right Panel - Form */}
      <div className="login-right">
        <div className="login-box">
          <h2>Welcome back</h2>
          <p className="login-subtitle">Sign in to your account to continue</p>

          {error && <div className="error-message">{error}</div>}

          <button type="button" className="auto-fill-btn" onClick={handleAutoFill}>
            Use demo credentials
          </button>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
