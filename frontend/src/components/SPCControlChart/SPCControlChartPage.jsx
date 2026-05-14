import React, { useState } from 'react';
import axios from 'axios';

// Calls POST /api/ai/spc-control-chart. Server computes Shewhart X-bar/R limits
// for n in [2..10] and asks AI to interpret out-of-control patterns. 503 when
// OPENROUTER_API_KEY is missing.
function SPCControlChartPage() {
  const [form, setForm] = useState({
    measurement: 'fastener_diameter_mm',
    target: 6.0,
    subgroups: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const loadSample = () => {
    setForm({
      measurement: 'fastener_diameter_mm',
      target: 6.0,
      subgroups: JSON.stringify([
        [6.01, 5.99, 6.02, 5.98],
        [6.00, 6.01, 5.97, 6.02],
        [6.05, 6.10, 6.07, 6.04],
        [5.97, 5.96, 5.98, 5.97],
        [6.00, 6.01, 6.00, 5.99],
      ]),
    });
  };

  const parseSubgroups = (v) => {
    if (typeof v !== 'string' || !v.trim()) return null;
    try {
      const parsed = JSON.parse(v);
      if (Array.isArray(parsed) && parsed.every((s) => Array.isArray(s))) return parsed;
      return null;
    } catch { return null; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null);
    const subgroups = parseSubgroups(form.subgroups);
    if (!subgroups || subgroups.length === 0) {
      setError('Subgroups must be a JSON array of arrays (e.g. [[6.01,5.99],[6.0,6.01]]).');
      return;
    }
    setLoading(true);
    try {
      const payload = {
        measurement: form.measurement,
        target: form.target === '' ? undefined : Number(form.target),
        subgroups,
      };
      const { data } = await axios.post('/api/ai/spc-control-chart', payload);
      setResult(data);
    } catch (err) {
      if (err.response?.status === 503) {
        const msg = err.response.data?.error || 'AI service unavailable.';
        const missing = err.response.data?.missing;
        setError(missing ? `${msg} (missing: ${missing})` : msg);
      } else {
        setError(err.response?.data?.error || err.message || 'Request failed');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><a href="/">Dashboard</a> / SPC Control Chart</div>
          <h2>AI SPC Control Chart (X-bar / R)</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Compute Shewhart X-bar / R limits for n=2..10 and have AI flag out-of-control signals and trends.
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={loadSample}>Load Sample</button>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1rem', display: 'grid', gap: '0.75rem' }}>
        <div>
          <label>Measurement</label>
          <input name="measurement" value={form.measurement} onChange={handleChange} />
        </div>
        <div>
          <label>Target</label>
          <input name="target" type="number" step="0.01" value={form.target} onChange={handleChange} />
        </div>
        <div>
          <label>Subgroups (JSON array of equal-length arrays)</label>
          <textarea rows={6} name="subgroups" value={form.subgroups} onChange={handleChange} placeholder='[[6.01,5.99,6.02],[6.00,6.01,5.97]]' />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Computing…' : 'Compute Chart'}</button>
        </div>
        {error && <div style={{ color: '#b00020' }}>{error}</div>}
        {result && (
          <div>
            {result.limits && (
              <div style={{ marginBottom: 8 }}>
                <strong>Limits:</strong> UCL={result.limits.UCL_x?.toFixed(4)} CL={result.limits.CL_x?.toFixed(4)} LCL={result.limits.LCL_x?.toFixed(4)} | R: UCL={result.limits.UCL_r?.toFixed(4)} CL={result.limits.CL_r?.toFixed(4)} LCL={result.limits.LCL_r?.toFixed(4)}
              </div>
            )}
            <pre style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: 6, overflow: 'auto', fontSize: 13 }}>{JSON.stringify(result, null, 2)}</pre>
          </div>
        )}
      </form>
    </div>
  );
}

export default SPCControlChartPage;
