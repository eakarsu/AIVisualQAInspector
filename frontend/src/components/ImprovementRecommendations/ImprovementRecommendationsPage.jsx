import AIReport from '../AIReport';
import NativeAIPresets from '../NativeAIPresets';
import React, { useState } from 'react';
import axios from 'axios';

function ImprovementRecommendationsPage() {
  const [form, setForm] = useState({
    product: '',
    timeframe_days: 30,
    pain_points: '',
    metrics: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const loadSample = () => {
    setForm({
      product: 'Widget Pro',
      timeframe_days: 30,
      pain_points: 'Repeated coating thickness variation; high rework on Line B',
      metrics: '{"defect_rate_pct": 4.1, "rework_pct": 6.8, "first_pass_yield_pct": 89.2}',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.metrics) {
        try { payload.metrics = JSON.parse(payload.metrics); }
        catch { payload.metrics = { notes: payload.metrics }; }
      }
      payload.timeframe_days = Number(payload.timeframe_days) || 30;
      const { data } = await axios.post('/api/ai/improvement-recommendations', payload);
      setResult(data);
    } catch (err) {
      setError(err.response?.data?.error || err.message || 'Request failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><a href="/">Dashboard</a> / Improvement Recommendations</div>
          <h2>AI Improvement Recommendations</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Six-Sigma-style improvement plan with quick wins and longer-term initiatives.
          </p>
        </div>
        <NativeAIPresets kind="improvement" value={form} onChange={setForm} disabled={loading} />
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg, #fff)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <div className="form-group"><label>Product *</label><input type="text" name="product" value={form.product} onChange={handleChange} required /></div>
        <div className="form-group"><label>Timeframe (days)</label><input type="number" name="timeframe_days" value={form.timeframe_days} onChange={handleChange} /></div>
        <div className="form-group"><label>Pain Points *</label><textarea name="pain_points" value={form.pain_points} onChange={handleChange} rows={3} required /></div>
        <div className="form-group"><label>Quality Metrics (JSON or notes)</label><textarea name="metrics" value={form.metrics} onChange={handleChange} rows={4} placeholder='{"defect_rate_pct": 4.1}' /></div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Analyzing...' : 'Generate Improvement Plan'}</button>
      </form>

      {loading && <div className="loading-spinner"><div className="spinner"></div></div>}

      {result && (
        <div style={{ background: 'var(--card-bg, #fff)', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <h3>AI Improvement Plan</h3>
          <AIReport response={result} title="AI analysis" />
        </div>
      )}
    </div>
  );
}

export default ImprovementRecommendationsPage;
