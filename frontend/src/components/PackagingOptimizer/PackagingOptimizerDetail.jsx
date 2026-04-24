import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';
import AIResultDisplay from '../common/AIResultDisplay';

function PackagingOptimizerDetail() {
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
      const [itemRes, productsRes] = await Promise.all([axios.get(`/api/packaging-optimizer/${id}`), axios.get('/api/products')]);
      setItem(itemRes.data);
      setProducts(productsRes.data);
      setFormData({ ...itemRes.data, optimization_goals: itemRes.data.optimization_goals?.join(', ') || '' });
    } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = { ...formData };
      if (typeof payload.optimization_goals === 'string') payload.optimization_goals = payload.optimization_goals.split(',').map(g => g.trim());
      await axios.put(`/api/packaging-optimizer/${id}`, payload);
      setShowEditModal(false);
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to update'); }
  };
  const handleDelete = async () => {
    try { await axios.delete(`/api/packaging-optimizer/${id}`); navigate('/packaging-optimizer'); }
    catch (err) { setError('Failed to delete'); }
  };
  const handleReanalyze = async () => {
    setAnalyzing(true);
    try { await axios.post(`/api/packaging-optimizer/${id}/analyze`); fetchData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to run AI analysis'); }
    finally { setAnalyzing(false); }
  };

  const getFragilityBadge = (level) => {
    const colors = { very_high: 'severity-critical', high: 'severity-high', medium: 'severity-medium', low: 'severity-low' };
    return <span className={`badge ${colors[level] || 'badge-secondary'}`}>{level?.replace('_', ' ')}</span>;
  };

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (error || !item) return (
    <div className="main-content">
      <div className="error-message">{error || 'Item not found'}</div>
      <button className="btn btn-outline" onClick={() => navigate('/packaging-optimizer')}>Back to List</button>
    </div>
  );

  return (
    <div className="main-content">
      <div className="breadcrumb"><a href="/">Dashboard</a> / <a href="/packaging-optimizer">AI Packaging Optimizer</a> / {item.optimization_name}</div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{item.optimization_name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {getFragilityBadge(item.fragility_level)}
              {item.ai_analysis && <span className="badge" style={{ background: '#f97316', color: 'white' }}>AI Optimized</span>}
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Optimizing...' : '📦 Re-optimize with AI'}</button>
            <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>Edit</button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete</button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item"><div className="detail-label">Product</div><div className="detail-value">{item.product?.name || 'N/A'}</div></div>
          <div className="detail-item"><div className="detail-label">Current Packaging</div><div className="detail-value">{item.current_packaging}</div></div>
          <div className="detail-item"><div className="detail-label">Product Weight</div><div className="detail-value">{item.product_weight ? `${item.product_weight} kg` : 'N/A'}</div></div>
          <div className="detail-item"><div className="detail-label">Fragility Level</div><div className="detail-value">{getFragilityBadge(item.fragility_level)}</div></div>
        </div>

        {item.shipping_requirements && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Shipping Requirements</div>
            <div className="detail-value">{item.shipping_requirements}</div>
          </div>
        )}

        {item.optimization_goals?.length > 0 && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Optimization Goals</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {item.optimization_goals.map((goal, idx) => (
                <span key={idx} style={{ background: '#fef3c7', color: '#92400e', padding: '0.25rem 0.75rem', borderRadius: '9999px', fontSize: '0.875rem' }}>{goal}</span>
              ))}
            </div>
          </div>
        )}

        {item.product_dimensions && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Product Dimensions</div>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {Object.entries(item.product_dimensions).map(([key, value]) => (
                <span key={key} style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{key}: <strong>{value}</strong></span>
              ))}
            </div>
          </div>
        )}

        {item.ai_analysis && <AIResultDisplay result={item.ai_analysis} title="AI Packaging Optimization Results" />}

        {!item.ai_analysis && (
          <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '0.75rem', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📦</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#64748b' }}>No AI Analysis Yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Click the button below to get AI packaging recommendations</p>
            <button className="btn btn-primary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Optimizing...' : 'Run AI Packaging Optimization'}</button>
          </div>
        )}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Packaging Optimization">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Product</label><select name="product_id" value={formData.product_id || ''} onChange={handleInputChange}><option value="">Select a product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-group"><label>Optimization Name</label><input type="text" name="optimization_name" value={formData.optimization_name || ''} onChange={handleInputChange} required /></div>
          <div className="form-group"><label>Current Packaging</label><input type="text" name="current_packaging" value={formData.current_packaging || ''} onChange={handleInputChange} required /></div>
          <div className="form-group"><label>Product Weight (kg)</label><input type="number" step="0.01" name="product_weight" value={formData.product_weight || ''} onChange={handleInputChange} /></div>
          <div className="form-group"><label>Fragility Level</label><select name="fragility_level" value={formData.fragility_level || 'medium'} onChange={handleInputChange}><option value="very_high">Very High</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
          <div className="form-group"><label>Shipping Requirements</label><textarea name="shipping_requirements" value={formData.shipping_requirements || ''} onChange={handleInputChange} rows={2} /></div>
          <div className="form-group"><label>Optimization Goals</label><input type="text" name="optimization_goals" value={formData.optimization_goals || ''} onChange={handleInputChange} placeholder="e.g., Cost, Sustainability" /></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Optimization">
        <p>Are you sure you want to delete this packaging optimization? This action cannot be undone.</p>
        <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
      </Modal>
    </div>
  );
}

export default PackagingOptimizerDetail;
