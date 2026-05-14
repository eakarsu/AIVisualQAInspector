import React, { useState } from 'react';
import axios from 'axios';

function PredictiveQualityPage() {
  const [form, setForm] = useState({
    product: '',
    line: '',
    historical_defect_rate: '',
    threshold: '',
    parameters: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const loadSample = () => {
    setForm({
      product: 'Widget Pro',
      line: 'Line A',
      historical_defect_rate: '2.4',
      threshold: '3.0',
      parameters: '{"temp_c": 178, "pressure_bar": 5.2, "speed_rpm": 1200}',
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const payload = { ...form };
      if (payload.parameters) {
        try { payload.parameters = JSON.parse(payload.parameters); }
        catch { payload.parameters = { notes: payload.parameters }; }
      }
      payload.historical_defect_rate = Number(payload.historical_defect_rate) || undefined;
      payload.threshold = Number(payload.threshold) || undefined;
      const { data } = await axios.post('/api/ai/predictive-quality', payload);
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
          <div className="breadcrumb"><a href="/">Dashboard</a> / Predictive Quality</div>
          <h2>AI Predictive Quality</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Predict whether the next run will exceed the defect threshold and recommend parameter adjustments.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={loadSample}>Load Sample</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg, #fff)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <div className="form-group"><label>Product *</label><input type="text" name="product" value={form.product} onChange={handleChange} required /></div>
        <div className="form-group"><label>Line *</label><input type="text" name="line" value={form.line} onChange={handleChange} required /></div>
        <div className="form-group"><label>Historical Defect Rate (%)</label><input type="number" step="0.01" name="historical_defect_rate" value={form.historical_defect_rate} onChange={handleChange} /></div>
        <div className="form-group"><label>Threshold (%)</label><input type="number" step="0.01" name="threshold" value={form.threshold} onChange={handleChange} /></div>
        <div className="form-group"><label>Process Parameters (JSON or notes)</label><textarea name="parameters" value={form.parameters} onChange={handleChange} rows={4} placeholder='{"temp_c": 178, "pressure_bar": 5.2}' /></div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Predicting...' : 'Predict Quality'}</button>
      </form>

      {loading && (
        <div className="loading-spinner"><div className="spinner"></div></div>
      )}

      {result && (
        <div style={{ background: 'var(--card-bg, #fff)', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <h3>AI Prediction</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', background: 'var(--bg-subtle, #f8fafc)', padding: '1rem', borderRadius: '0.5rem' }}>
            {typeof (result.result || result.prediction) === 'string'
              ? (result.result || result.prediction)
              : JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default PredictiveQualityPage;
