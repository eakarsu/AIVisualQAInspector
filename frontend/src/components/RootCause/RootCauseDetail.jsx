import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';
import AIResultDisplay from '../common/AIResultDisplay';

function RootCauseDetail() {
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
      const [itemRes, productsRes] = await Promise.all([axios.get(`/api/root-cause/${id}`), axios.get('/api/products')]);
      setItem(itemRes.data);
      setProducts(productsRes.data);
      setFormData(itemRes.data);
    } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    try { await axios.put(`/api/root-cause/${id}`, formData); setShowEditModal(false); fetchData(); }
    catch (err) { setFormError(err.response?.data?.error || 'Failed to update'); }
  };
  const handleDelete = async () => {
    try { await axios.delete(`/api/root-cause/${id}`); navigate('/root-cause'); }
    catch (err) { setError('Failed to delete'); }
  };
  const handleReanalyze = async () => {
    setAnalyzing(true);
    try { await axios.post(`/api/root-cause/${id}/analyze`); fetchData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to run AI analysis'); }
    finally { setAnalyzing(false); }
  };

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (error || !item) return (
    <div className="main-content">
      <div className="error-message">{error || 'Item not found'}</div>
      <button className="btn btn-outline" onClick={() => navigate('/root-cause')}>Back to List</button>
    </div>
  );

  return (
    <div className="main-content">
      <div className="breadcrumb"><a href="/">Dashboard</a> / <a href="/root-cause">AI Root Cause Analyzer</a> / {item.problem_name}</div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{item.problem_name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {item.ai_analysis && <span className="badge" style={{ background: '#ec4899', color: 'white' }}>AI Analyzed</span>}
              {item.root_causes?.length > 0 && <span className="badge badge-info">{item.root_causes.length} Root Causes</span>}
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : '🔬 Re-analyze with AI'}</button>
            <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>Edit</button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete</button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item"><div className="detail-label">Product</div><div className="detail-value">{item.product?.name || 'N/A'}</div></div>
          <div className="detail-item"><div className="detail-label">Created</div><div className="detail-value">{new Date(item.created_at).toLocaleString()}</div></div>
        </div>

        <div className="detail-item" style={{ marginTop: '1.5rem' }}>
          <div className="detail-label">Problem Description</div>
          <div className="detail-value" style={{ whiteSpace: 'pre-wrap' }}>{item.problem_description}</div>
        </div>

        {item.ai_analysis && <AIResultDisplay result={item.ai_analysis} title="AI Root Cause Analysis Results" />}

        {!item.ai_analysis && (
          <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '0.75rem', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔬</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#64748b' }}>No AI Analysis Yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Click the button below to perform root cause analysis using AI</p>
            <button className="btn btn-primary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Analyzing...' : 'Run AI Root Cause Analysis'}</button>
          </div>
        )}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Root Cause Analysis">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Product</label><select name="product_id" value={formData.product_id || ''} onChange={handleInputChange}><option value="">Select a product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
          <div className="form-group"><label>Problem Name</label><input type="text" name="problem_name" value={formData.problem_name || ''} onChange={handleInputChange} required /></div>
          <div className="form-group"><label>Problem Description</label><textarea name="problem_description" value={formData.problem_description || ''} onChange={handleInputChange} rows={5} /></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete Analysis">
        <p>Are you sure you want to delete this root cause analysis? This action cannot be undone.</p>
        <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
      </Modal>
    </div>
  );
}

export default RootCauseDetail;
