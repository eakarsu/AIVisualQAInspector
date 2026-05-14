import React, { useState } from 'react';
import axios from 'axios';

// Calls POST /api/ai/defect-parameter-correlation. Returns 503 with
// `missing: OPENROUTER_API_KEY` when the env var is unset.
function DefectParameterCorrelationPage() {
  const [form, setForm] = useState({
    productLine: '',
    lookbackDays: 30,
    defectSeries: '',
    parameterSeries: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const loadSample = () => {
    setForm({
      productLine: 'Line-7',
      lookbackDays: 30,
      defectSeries: '[{"ts":"2024-01-01","count":5,"type":"thread"},{"ts":"2024-01-02","count":18,"type":"thread"}]',
      parameterSeries: '[{"ts":"2024-01-01","temp":182,"speed":120,"materialLot":"L1"},{"ts":"2024-01-02","temp":201,"speed":120,"materialLot":"L2"}]',
    });
  };

  const parseField = (v) => {
    if (typeof v !== 'string' || !v.trim()) return undefined;
    try { return JSON.parse(v); } catch { return v; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setResult(null); setLoading(true);
    try {
      const payload = {
        productLine: form.productLine,
        lookbackDays: Number(form.lookbackDays) || undefined,
        defectSeries: parseField(form.defectSeries),
        parameterSeries: parseField(form.parameterSeries),
      };
      const { data } = await axios.post('/api/ai/defect-parameter-correlation', payload);
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
          <div className="breadcrumb"><a href="/">Dashboard</a> / Defect-Parameter Correlation</div>
          <h2>AI Defect ↔ Parameter Correlation</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Correlate defect rates with process parameter shifts to surface root-cause candidates.
          </p>
        </div>
        <button type="button" className="btn btn-secondary" onClick={loadSample}>Load Sample</button>
      </div>

      <form onSubmit={handleSubmit} className="card" style={{ padding: '1rem', display: 'grid', gap: '0.75rem' }}>
        <div>
          <label>Product line</label>
          <input name="productLine" value={form.productLine} onChange={handleChange} />
        </div>
        <div>
          <label>Lookback (days)</label>
          <input name="lookbackDays" type="number" value={form.lookbackDays} onChange={handleChange} />
        </div>
        <div>
          <label>Defect series (JSON)</label>
          <textarea rows={4} name="defectSeries" value={form.defectSeries} onChange={handleChange} placeholder='[{"ts":"2024-01-01","count":5,"type":"scratch"}]' />
        </div>
        <div>
          <label>Parameter series (JSON)</label>
          <textarea rows={4} name="parameterSeries" value={form.parameterSeries} onChange={handleChange} placeholder='[{"ts":"2024-01-01","temp":182,"speed":120}]' />
        </div>
        <div>
          <button className="btn btn-primary" type="submit" disabled={loading}>{loading ? 'Analyzing…' : 'Run Correlation'}</button>
        </div>
        {error && <div style={{ color: '#b00020' }}>{error}</div>}
        {result && (
          <pre style={{ background: '#f5f5f5', padding: '0.75rem', borderRadius: 6, overflow: 'auto', fontSize: 13 }}>{JSON.stringify(result, null, 2)}</pre>
        )}
      </form>
    </div>
  );
}

export default DefectParameterCorrelationPage;
