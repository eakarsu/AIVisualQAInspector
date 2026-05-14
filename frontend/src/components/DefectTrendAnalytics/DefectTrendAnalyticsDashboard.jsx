import React, { useState, useEffect } from 'react';
import axios from 'axios';
import AIResultDisplay from '../common/AIResultDisplay';

function DefectTrendAnalyticsDashboard() {
  const [products, setProducts] = useState([]);
  const [productId, setProductId] = useState('');
  const [days, setDays] = useState(30);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    axios.get('/api/products').then(r => setProducts(r.data)).catch(() => {});
    fetchTimeSeries();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchTimeSeries = async () => {
    setLoading(true);
    setError('');
    try {
      const params = new URLSearchParams();
      if (productId) params.append('product_id', productId);
      params.append('days', days);
      const res = await axios.get(`/api/defect-trend-analytics/time-series?${params.toString()}`);
      setData(res.data);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to fetch trend data');
    } finally {
      setLoading(false);
    }
  };

  const runAIAnalysis = async () => {
    setAnalyzing(true);
    setAnalysis(null);
    try {
      const res = await axios.post('/api/defect-trend-analytics/analyze', {
        product_id: productId || undefined,
        days
      });
      setAnalysis(res.data.analysis);
    } catch (err) {
      setError(err.response?.data?.error || 'AI analysis failed');
    } finally {
      setAnalyzing(false);
    }
  };

  const ts = data?.time_series || [];
  const byProduct = data?.by_product || [];
  const maxCount = Math.max(...ts.map(d => d.count), 1);

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <a href="/">Dashboard</a> / Defect Trend Analytics
          </div>
          <h2>Defect Trend Analytics</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Time-series defect tracking + AI predictive analysis
          </p>
        </div>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ marginBottom: 0, minWidth: '200px' }}>
          <label>Product Filter</label>
          <select value={productId} onChange={(e) => setProductId(e.target.value)}>
            <option value="">All Products</option>
            {products.map(p => (
              <option key={p.id} value={p.id}>{p.name}</option>
            ))}
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0, minWidth: '120px' }}>
          <label>Time Range (days)</label>
          <input type="number" min="1" max="365" value={days} onChange={(e) => setDays(parseInt(e.target.value) || 30)} />
        </div>
        <button className="btn btn-outline" onClick={fetchTimeSeries} disabled={loading}>
          {loading ? 'Loading...' : 'Refresh'}
        </button>
        <button className="btn btn-primary" onClick={runAIAnalysis} disabled={analyzing}>
          {analyzing ? '🤖 Analyzing...' : '🤖 Run AI Trend Analysis'}
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      {data && (
        <>
          <div className="stats-row">
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-value">{data.total_defects}</div>
                <div className="stat-label">Total Defects</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-value">{ts.length}</div>
                <div className="stat-label">Days with Defects</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-value">{data.date_range?.from || '-'}</div>
                <div className="stat-label">From</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-info">
                <div className="stat-value">{data.date_range?.to || '-'}</div>
                <div className="stat-label">To</div>
              </div>
            </div>
          </div>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Defects Over Time</h3>
            {ts.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No defects in this period.</p>
            ) : (
              <div style={{ display: 'flex', alignItems: 'flex-end', gap: '0.5rem', height: '220px', overflowX: 'auto', paddingBottom: '1rem' }}>
                {ts.map(d => (
                  <div key={d.date} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '40px' }}>
                    <div style={{ fontSize: '0.7rem', marginBottom: '0.25rem' }}>{d.count}</div>
                    <div style={{
                      width: '32px',
                      height: `${(d.count / maxCount) * 160}px`,
                      background: 'linear-gradient(180deg, #6366f1 0%, #8b5cf6 100%)',
                      borderRadius: '4px 4px 0 0',
                      display: 'flex',
                      flexDirection: 'column-reverse'
                    }}>
                      {d.critical > 0 && <div style={{ height: `${(d.critical / d.count) * 100}%`, background: '#dc2626', borderRadius: '0' }} />}
                    </div>
                    <div style={{ fontSize: '0.6rem', marginTop: '0.25rem', transform: 'rotate(-45deg)', whiteSpace: 'nowrap' }}>{d.date.slice(5)}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="card" style={{ padding: '1.5rem', marginBottom: '1.5rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Defects by Product</h3>
            {byProduct.length === 0 ? (
              <p style={{ color: 'var(--text-secondary)' }}>No product data.</p>
            ) : (
              <table className="data-table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Total Defects</th>
                    <th>Top Defect Types</th>
                  </tr>
                </thead>
                <tbody>
                  {byProduct.sort((a, b) => b.count - a.count).map(p => (
                    <tr key={p.product_id}>
                      <td>{p.product_name || `Product #${p.product_id}`}</td>
                      <td><strong>{p.count}</strong></td>
                      <td>
                        {Object.entries(p.types || {}).sort((a, b) => b[1] - a[1]).slice(0, 3).map(([t, c]) => (
                          <span key={t} className="badge badge-secondary" style={{ marginRight: '0.25rem' }}>
                            {t}: {c}
                          </span>
                        ))}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {analysis && (
            <AIResultDisplay result={analysis} title="AI Trend Analysis" />
          )}
        </>
      )}
    </div>
  );
}

export default DefectTrendAnalyticsDashboard;
