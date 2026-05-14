import React, { useState } from 'react';
import axios from 'axios';

function SupplierQualityScorePage() {
  const [form, setForm] = useState({
    supplierName: '',
    productCategory: '',
    lookbackDays: 180,
    onTimeDeliveryPct: '',
    reworkRatePct: '',
    defectStats: '',
    certifications: '',
    auditFindings: '',
    historicalIncidents: '',
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleChange = (e) => setForm((p) => ({ ...p, [e.target.name]: e.target.value }));

  const loadSample = () => {
    setForm({
      supplierName: 'Acme Components Co.',
      productCategory: 'precision-fasteners',
      lookbackDays: 180,
      onTimeDeliveryPct: 92.4,
      reworkRatePct: 3.1,
      defectStats: '{"ppm": 1850, "topDefects": ["thread defect", "plating spotting"]}',
      certifications: '["ISO9001", "IATF16949"]',
      auditFindings: '[{"date":"2024-09-12","finding":"minor: incoming inspection sampling","status":"closed"}]',
      historicalIncidents: '[{"date":"2024-08-01","type":"shipment hold","root_cause":"plating bath drift"}]',
    });
  };

  const parseField = (val) => {
    if (typeof val !== 'string' || !val.trim()) return undefined;
    try { return JSON.parse(val); } catch { return val; }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setResult(null);
    setLoading(true);
    try {
      const payload = {
        supplierName: form.supplierName,
        productCategory: form.productCategory,
        lookbackDays: Number(form.lookbackDays) || undefined,
        onTimeDeliveryPct: form.onTimeDeliveryPct === '' ? undefined : Number(form.onTimeDeliveryPct),
        reworkRatePct: form.reworkRatePct === '' ? undefined : Number(form.reworkRatePct),
        defectStats: parseField(form.defectStats),
        certifications: parseField(form.certifications),
        auditFindings: parseField(form.auditFindings),
        historicalIncidents: parseField(form.historicalIncidents),
      };
      const { data } = await axios.post('/api/ai/supplier-quality-score', payload);
      setResult(data);
    } catch (err) {
      if (err.response?.status === 503) {
        setError(err.response.data?.error || 'AI service unavailable.');
      } else {
        setError(err.response?.data?.error || err.message || 'Request failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><a href="/">Dashboard</a> / Supplier Quality Score</div>
          <h2>AI Supplier Quality Score</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Score a supplier's quality from historical defect, rework, delivery, audit, and incident data.
          </p>
        </div>
        <button type="button" className="btn btn-outline" onClick={loadSample}>Load Sample</button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <form onSubmit={handleSubmit} style={{ background: 'var(--card-bg, #fff)', padding: '1.5rem', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
        <div className="form-group"><label>Supplier Name *</label><input type="text" name="supplierName" value={form.supplierName} onChange={handleChange} required /></div>
        <div className="form-group"><label>Product Category</label><input type="text" name="productCategory" value={form.productCategory} onChange={handleChange} /></div>
        <div className="form-group"><label>Lookback (days)</label><input type="number" name="lookbackDays" value={form.lookbackDays} onChange={handleChange} /></div>
        <div className="form-group"><label>On-Time Delivery (%)</label><input type="number" step="0.1" name="onTimeDeliveryPct" value={form.onTimeDeliveryPct} onChange={handleChange} /></div>
        <div className="form-group"><label>Rework Rate (%)</label><input type="number" step="0.1" name="reworkRatePct" value={form.reworkRatePct} onChange={handleChange} /></div>
        <div className="form-group"><label>Defect Stats (JSON)</label><textarea name="defectStats" value={form.defectStats} onChange={handleChange} rows={3} placeholder='{"ppm": 1500, "topDefects": ["..."]}' /></div>
        <div className="form-group"><label>Certifications (JSON array)</label><textarea name="certifications" value={form.certifications} onChange={handleChange} rows={2} placeholder='["ISO9001"]' /></div>
        <div className="form-group"><label>Audit Findings (JSON array)</label><textarea name="auditFindings" value={form.auditFindings} onChange={handleChange} rows={3} /></div>
        <div className="form-group"><label>Historical Incidents (JSON array)</label><textarea name="historicalIncidents" value={form.historicalIncidents} onChange={handleChange} rows={3} /></div>
        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Scoring...' : 'Score Supplier'}</button>
      </form>

      {loading && <div className="loading-spinner"><div className="spinner"></div></div>}

      {result && (
        <div style={{ background: 'var(--card-bg, #fff)', padding: '1.5rem', borderRadius: '0.5rem' }}>
          <h3>AI Supplier Score</h3>
          <pre style={{ whiteSpace: 'pre-wrap', fontSize: '0.875rem', background: 'var(--bg-subtle, #f8fafc)', padding: '1rem', borderRadius: '0.5rem' }}>
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}

export default SupplierQualityScorePage;
