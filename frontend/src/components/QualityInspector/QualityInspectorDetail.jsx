import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';
import AIResultDisplay from '../common/AIResultDisplay';

function QualityInspectorDetail() {
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
      const [itemRes, productsRes] = await Promise.all([axios.get(`/api/quality-inspector/${id}`), axios.get('/api/products')]);
      setItem(itemRes.data);
      setProducts(productsRes.data);
      setFormData({ ...itemRes.data, parameters: JSON.stringify(itemRes.data.parameters || {}, null, 2) });
    } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      const payload = { ...formData };
      if (typeof payload.parameters === 'string') { try { payload.parameters = JSON.parse(payload.parameters); } catch { payload.parameters = {}; } }
      await axios.put(`/api/quality-inspector/${id}`, payload);
      setShowEditModal(false);
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to update'); }
  };
  const handleDelete = async () => {
    try { await axios.delete(`/api/quality-inspector/${id}`); navigate('/quality-inspector'); }
    catch (err) { setError('Failed to delete'); }
  };
  const handleReanalyze = async () => {
    setAnalyzing(true);
    try { await axios.post(`/api/quality-inspector/${id}/analyze`); fetchData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to run AI analysis'); }
    finally { setAnalyzing(false); }
  };

  const getStatusBadge = (status) => {
    const colors = { passed: 'badge-success', failed: 'badge-danger', pending: 'badge-secondary', in_progress: 'badge-warning', needs_review: 'badge-info' };
    return <span className={`badge ${colors[status] || 'badge-secondary'}`}>{status?.replace('_', ' ')}</span>;
  };

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (error || !item) return (
    <div className="main-content">
      <div className="error-message">{error || 'Item not found'}</div>
      <button className="btn btn-outline" onClick={() => navigate('/quality-inspector')}>Back to List</button>
    </div>
  );

  return (
    <div className="main-content">
      <div className="breadcrumb"><a href="/">Dashboard</a> / <a href="/quality-inspector">AI Quality Inspector</a> / {item.inspection_name}</div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{item.inspection_name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {getStatusBadge(item.status)}
              {item.quality_score && <span className="badge" style={{ background: item.quality_score >= 90 ? '#22c55e' : item.quality_score >= 75 ? '#f59e0b' : '#ef4444', color: 'white' }}>{item.quality_score}%</span>}
              {item.ai_analysis && <span className="badge" style={{ background: '#10b981', color: 'white' }}>AI Analyzed</span>}
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : '✅ Re-inspect with AI'}</button>
            <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>Edit</button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete</button>
          </div>
        </div>

        {item.quality_score && (
          <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: item.quality_score >= 90 ? '#dcfce7' : item.quality_score >= 75 ? '#fef3c7' : '#fee2e2', borderRadius: '0.75rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div><div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.25rem' }}>Quality Score</div><div style={{ fontSize: '2.5rem', fontWeight: '700', color: item.quality_score >= 90 ? '#166534' : item.quality_score >= 75 ? '#92400e' : '#991b1b' }}>{item.quality_score}%</div></div>
              <div style={{ fontSize: '4rem' }}>{item.quality_score >= 90 ? '✅' : item.quality_score >= 75 ? '⚠️' : '❌'}</div>
            </div>
          </div>
        )}

        <div className="detail-grid">
          <div className="detail-item"><div className="detail-label">Product</div><div className="detail-value">{item.product?.name || 'N/A'}</div></div>
          <div className="detail-item"><div className="detail-label">Batch Number</div><div className="detail-value">{item.batch_number}</div></div>
          <div className="detail-item"><div className="detail-label">Inspection Type</div><div className="detail-value">{item.inspection_type}</div></div>
          <div className="detail-item"><div className="detail-label">Inspector</div><div className="detail-value">{item.inspector_name || 'AI Inspector'}</div></div>
          <div className="detail-item"><div className="detail-label">Status</div><div className="detail-value">{getStatusBadge(item.status)}</div></div>
          <div className="detail-item"><div className="detail-label">Created</div><div className="detail-value">{new Date(item.created_at).toLocaleString()}</div></div>
        </div>

        {item.parameters && Object.keys(item.parameters).length > 0 && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Inspection Parameters</div>
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.5rem' }}>
              {Object.entries(item.parameters).map(([key, value]) => (
                <span key={key} style={{ background: '#e0f2fe', color: '#0369a1', padding: '0.25rem 0.75rem', borderRadius: '0.5rem', fontSize: '0.875rem' }}>{key}: <strong>{String(value)}</strong></span>
              ))}
            </div>
          </div>
        )}

        {item.ai_analysis && <AIResultDisplay result={item.ai_analysis} title="AI Quality Inspection Results" />}

        {!item.ai_analysis && (
          <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '0.75rem', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#64748b' }}>No AI Analysis Yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Click the button below to run AI quality inspection</p>
            <button className="btn btn-primary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Run AI Quality Inspection'}</button>
          </div>
        )}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Quality Inspection">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Product</label><select name="product_id" value={formData.product_id || ''} onChange={handleInputChange}><option value="">Select a product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-group"><label>Inspection Name</label><input type="text" name="inspection_name" value={formData.inspection_name || ''} onChange={handleInputChange} required /></div>
          <div className="form-group"><label>Batch Number</label><input type="text" name="batch_number" value={formData.batch_number || ''} onChange={handleInputChange} required /></div>
          <div className="form-group"><label>Inspection Type</label><select name="inspection_type" value={formData.inspection_type || ''} onChange={handleInputChange}><option value="Final QC">Final QC</option><option value="Incoming">Incoming</option><option value="In-Process">In-Process</option><option value="Visual">Visual</option><option value="Functional">Functional</option></select></div>
          <div className="form-group"><label>Inspector Name</label><input type="text" name="inspector_name" value={formData.inspector_name || ''} onChange={handleInputChange} /></div>
          <div className="form-group"><label>Status</label><select name="status" value={formData.status || 'pending'} onChange={handleInputChange}><option value="pending">Pending</option><option value="in_progress">In Progress</option><option value="passed">Passed</option><option value="failed">Failed</option><option value="needs_review">Needs Review</option></select></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Inspection">
        <p>Are you sure you want to delete this quality inspection? This action cannot be undone.</p>
        <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
      </Modal>
    </div>
  );
}

export default QualityInspectorDetail;
