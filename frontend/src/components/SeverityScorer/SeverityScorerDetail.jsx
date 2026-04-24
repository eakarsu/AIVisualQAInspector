import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';
import AIResultDisplay from '../common/AIResultDisplay';

function SeverityScorerDetail() {
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
      const [itemRes, productsRes] = await Promise.all([
        axios.get(`/api/severity-scorer/${id}`),
        axios.get('/api/products')
      ]);
      setItem(itemRes.data);
      setProducts(productsRes.data);
      setFormData(itemRes.data);
    } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await axios.put(`/api/severity-scorer/${id}`, formData);
      setShowEditModal(false);
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to update'); }
  };

  const handleDelete = async () => {
    try { await axios.delete(`/api/severity-scorer/${id}`); navigate('/severity-scorer'); }
    catch (err) { setError('Failed to delete'); }
  };

  const handleReanalyze = async () => {
    setAnalyzing(true);
    try { await axios.post(`/api/severity-scorer/${id}/analyze`); fetchData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to run AI analysis'); }
    finally { setAnalyzing(false); }
  };

  const getScoreDisplay = (score) => {
    if (!score) return null;
    const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : score >= 40 ? '#eab308' : '#22c55e';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <div style={{ width: '120px', height: '10px', background: '#e2e8f0', borderRadius: '5px', overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '5px' }} />
        </div>
        <span style={{ fontSize: '1.5rem', fontWeight: '700', color }}>{score}/100</span>
      </div>
    );
  };

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (error || !item) return (
    <div className="main-content">
      <div className="error-message">{error || 'Item not found'}</div>
      <button className="btn btn-outline" onClick={() => navigate('/severity-scorer')}>Back to List</button>
    </div>
  );

  return (
    <div className="main-content">
      <div className="breadcrumb"><a href="/">Dashboard</a> / <a href="/severity-scorer">AI Severity Scorer</a> / {item.issue_name}</div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{item.issue_name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              <span className={`badge severity-${item.severity_level}`}>{item.severity_level}</span>
              {item.ai_analysis && <span className="badge" style={{ background: '#8b5cf6', color: 'white' }}>AI Analyzed</span>}
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={handleReanalyze} disabled={analyzing}>
              {analyzing ? 'Analyzing...' : '🤖 Re-analyze with AI'}
            </button>
            <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>Edit</button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete</button>
          </div>
        </div>

        {item.severity_score && (
          <div style={{ marginBottom: '1.5rem', padding: '1.5rem', background: '#f8fafc', borderRadius: '0.75rem' }}>
            <div style={{ fontSize: '0.875rem', color: '#64748b', marginBottom: '0.5rem' }}>Severity Score</div>
            {getScoreDisplay(item.severity_score)}
          </div>
        )}

        <div className="detail-grid">
          <div className="detail-item"><div className="detail-label">Product</div><div className="detail-value">{item.product?.name || 'N/A'}</div></div>
          <div className="detail-item"><div className="detail-label">Severity Level</div><div className="detail-value"><span className={`badge severity-${item.severity_level}`}>{item.severity_level}</span></div></div>
          <div className="detail-item"><div className="detail-label">Created</div><div className="detail-value">{new Date(item.created_at).toLocaleString()}</div></div>
        </div>

        {item.issue_description && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Issue Description</div>
            <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{item.issue_description}</div>
          </div>
        )}

        {item.ai_analysis && <AIResultDisplay result={item.ai_analysis} title="AI Severity Analysis Results" />}

        {!item.ai_analysis && (
          <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '0.75rem', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📈</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#64748b' }}>No AI Analysis Yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Click the button below to score severity using AI</p>
            <button className="btn btn-primary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Run AI Severity Analysis'}</button>
          </div>
        )}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Severity Assessment">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Product</label><select name="product_id" value={formData.product_id || ''} onChange={handleInputChange}><option value="">Select a product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
          <div className="form-group"><label>Issue Name</label><input type="text" name="issue_name" value={formData.issue_name || ''} onChange={handleInputChange} required /></div>
          <div className="form-group"><label>Issue Description</label><textarea name="issue_description" value={formData.issue_description || ''} onChange={handleInputChange} rows={4} /></div>
          <div className="form-group"><label>Severity Level</label><select name="severity_level" value={formData.severity_level || 'medium'} onChange={handleInputChange}><option value="critical">Critical</option><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Assessment">
        <p>Are you sure you want to delete this severity assessment? This action cannot be undone.</p>
        <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
      </Modal>
    </div>
  );
}

export default SeverityScorerDetail;
