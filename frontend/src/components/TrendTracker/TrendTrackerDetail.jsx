import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';
import AIResultDisplay from '../common/AIResultDisplay';

function TrendTrackerDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [item, setItem] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => { fetchData(); }, [id]);

  const fetchData = async () => {
    try {
      const [itemRes, productsRes] = await Promise.all([axios.get(`/api/trend-tracker/${id}`), axios.get('/api/products')]);
      setItem(itemRes.data);
      setProducts(productsRes.data);
      setFormData({ ...itemRes.data, data_points: itemRes.data.data_points?.join(', ') || '' });
    } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = { ...formData };
      if (typeof payload.data_points === 'string') {
        payload.data_points = payload.data_points.split(',').map(v => parseFloat(v.trim())).filter(v => !isNaN(v));
      }
      await axios.put(`/api/trend-tracker/${id}`, payload);
      setShowEditModal(false);
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to update'); }
  };
  const handleDelete = async () => {
    try { await axios.delete(`/api/trend-tracker/${id}`); navigate('/trend-tracker'); }
    catch (err) { setError('Failed to delete'); }
  };
  const handleReanalyze = async () => {
    setAnalyzing(true);
    try { await axios.post(`/api/trend-tracker/${id}/analyze`); fetchData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to run AI analysis'); }
    finally { setAnalyzing(false); }
  };

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (error || !item) return (
    <div className="main-content">
      <div className="error-message">{error || 'Item not found'}</div>
      <button className="btn btn-outline" onClick={() => navigate('/trend-tracker')}>Back to List</button>
    </div>
  );

  return (
    <div className="main-content">
      <div className="breadcrumb"><a href="/">Dashboard</a> / <a href="/trend-tracker">AI Trend Tracker</a> / {item.trend_name}</div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{item.trend_name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className="badge badge-info">{item.trend_type}</span>
              {item.ai_analysis && <span className="badge" style={{ background: '#14b8a6', color: 'white' }}>AI Analyzed</span>}
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : '📈 Re-analyze with AI'}</button>
            <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>Edit</button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete</button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item"><div className="detail-label">Product</div><div className="detail-value">{item.product?.name || 'General'}</div></div>
          <div className="detail-item"><div className="detail-label">Analysis Period</div><div className="detail-value">{item.analysis_period}</div></div>
          <div className="detail-item"><div className="detail-label">Trend Type</div><div className="detail-value">{item.trend_type}</div></div>
          <div className="detail-item"><div className="detail-label">Created</div><div className="detail-value">{new Date(item.created_at).toLocaleString()}</div></div>
        </div>

        {item.data_points?.length > 0 && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Data Points</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {item.data_points.map((point, idx) => (
                <span key={idx} style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>{point}</span>
              ))}
            </div>
          </div>
        )}

        {item.ai_analysis && <AIResultDisplay result={item.ai_analysis} title="AI Trend Analysis Results" />}

        {!item.ai_analysis && (
          <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '0.75rem', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📉</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#64748b' }}>No AI Analysis Yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Click the button below to analyze trends using AI</p>
            <button className="btn btn-primary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Run AI Trend Analysis'}</button>
          </div>
        )}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Trend Analysis">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Product</label><select name="product_id" value={formData.product_id || ''} onChange={handleInputChange}><option value="">General</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-group"><label>Trend Name</label><input type="text" name="trend_name" value={formData.trend_name || ''} onChange={handleInputChange} required /></div>
          <div className="form-group"><label>Analysis Period</label><input type="text" name="analysis_period" value={formData.analysis_period || ''} onChange={handleInputChange} required /></div>
          <div className="form-group"><label>Trend Type</label><select name="trend_type" value={formData.trend_type || ''} onChange={handleInputChange}><option value="Defect Rate">Defect Rate</option><option value="Quality Score">Quality Score</option><option value="Yield Rate">Yield Rate</option><option value="Performance">Performance</option></select></div>
          <div className="form-group"><label>Data Points</label><input type="text" name="data_points" value={formData.data_points || ''} onChange={handleInputChange} placeholder="e.g., 2.5, 2.3, 2.1" /></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Analysis">
        <p>Are you sure you want to delete this trend analysis? This action cannot be undone.</p>
        <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
      </Modal>
    </div>
  );
}

export default TrendTrackerDetail;
