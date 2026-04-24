import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function TrendTrackerList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', trend_name: '', analysis_period: 'Q1 2024', trend_type: 'Defect Rate', data_points: '' });
  const [formError, setFormError] = useState('');

  const loadSampleData = () => {
    setFormData({
      product_id: products.length > 0 ? products[0].id : '',
      trend_name: 'Monthly Defect Rate - Assembly Line A',
      analysis_period: 'Jan-Jun 2024',
      trend_type: 'Defect Rate',
      data_points: '4.2, 3.8, 4.5, 3.1, 2.9, 2.4, 3.6, 2.1, 1.8, 2.2, 1.5, 1.3'
    });
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, productsRes] = await Promise.all([axios.get('/api/trend-tracker'), axios.get('/api/products')]);
      setItems(itemsRes.data);
      setProducts(productsRes.data);
    } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = { ...formData };
      if (payload.data_points) {
        payload.data_points = payload.data_points.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      }
      await axios.post('/api/trend-tracker', payload);
      setShowModal(false);
      setFormData({ product_id: '', trend_name: '', analysis_period: 'Q1 2024', trend_type: 'Defect Rate', data_points: '' });
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to create trend analysis'); } finally { setSubmitting(false); }
  };

  const getTrendBadge = (metrics) => {
    if (!metrics?.trend) return <span className="badge badge-secondary">Pending</span>;
    const trend = metrics.trend.toLowerCase();
    if (trend.includes('improv') || trend === 'decreasing') return <span className="badge badge-success">↑ Improving</span>;
    if (trend.includes('declin') || trend === 'increasing') return <span className="badge badge-danger">↓ Declining</span>;
    if (trend.includes('stable')) return <span className="badge badge-info">→ Stable</span>;
    return <span className="badge badge-warning">~ Volatile</span>;
  };

  const columns = [
    { header: 'Trend Name', accessor: 'trend_name' },
    { header: 'Product', accessor: 'product', render: (row) => row.product?.name || 'General' },
    { header: 'Period', accessor: 'analysis_period' },
    { header: 'Type', accessor: 'trend_type' },
    { header: 'Trend', accessor: 'metrics', render: (row) => getTrendBadge(row.metrics) },
    { header: 'AI Status', accessor: 'ai_analysis', render: (row) => row.ai_analysis ? <span className="badge badge-success">Analyzed</span> : <span className="badge badge-secondary">Pending</span> }
  ];

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><a href="/">Dashboard</a> / AI Trend Tracker</div>
          <h2>AI Trend Tracker</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Quality trend analysis and predictions</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Trend Analysis</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <Table columns={columns} data={items} onRowClick={(row) => navigate(`/trend-tracker/${row.id}`)} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Trend Analysis">
        {formError && <div className="error-message">{formError}</div>}
        <button type="button" className="btn btn-outline" onClick={loadSampleData} style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
          Load Sample Data
        </button>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product (Optional)</label>
            <select name="product_id" value={formData.product_id} onChange={handleInputChange}>
              <option value="">General / All Products</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Trend Name *</label>
            <input type="text" name="trend_name" value={formData.trend_name} onChange={handleInputChange} placeholder="e.g., Weekly Defect Rate Trend" required />
          </div>
          <div className="form-group">
            <label>Analysis Period *</label>
            <input type="text" name="analysis_period" value={formData.analysis_period} onChange={handleInputChange} placeholder="e.g., Q1 2024, Jan-Mar 2024" required />
          </div>
          <div className="form-group">
            <label>Trend Type *</label>
            <select name="trend_type" value={formData.trend_type} onChange={handleInputChange} required>
              <option value="Defect Rate">Defect Rate</option>
              <option value="Quality Score">Quality Score</option>
              <option value="Yield Rate">Yield Rate</option>
              <option value="Rejection Rate">Rejection Rate</option>
              <option value="Performance">Performance</option>
              <option value="Efficiency">Efficiency</option>
              <option value="Other">Other</option>
            </select>
          </div>
          <div className="form-group">
            <label>Data Points (Optional - comma separated)</label>
            <input type="text" name="data_points" value={formData.data_points} onChange={handleInputChange} placeholder="e.g., 2.5, 2.3, 2.1, 1.9, 1.8" />
            <small style={{ color: '#64748b' }}>Enter values separated by commas for more accurate analysis</small>
          </div>
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#065f46' }}>📈 AI will identify patterns, detect anomalies, and provide predictions based on the data.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Analyzing...' : 'Analyze Trends with AI'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default TrendTrackerList;
