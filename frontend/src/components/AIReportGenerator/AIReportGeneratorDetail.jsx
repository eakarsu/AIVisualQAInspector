import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';
import AIResultDisplay from '../common/AIResultDisplay';

function AIReportGeneratorDetail() {
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
      const [itemRes, productsRes] = await Promise.all([axios.get(`/api/report-generator/${id}`), axios.get('/api/products')]);
      setItem(itemRes.data);
      setProducts(productsRes.data);
      setFormData({ ...itemRes.data });
    } catch (err) { setError('Failed to fetch data'); } finally { setLoading(false); }
  };

  const handleInputChange = (e) => setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');
    try {
      await axios.put(`/api/report-generator/${id}`, formData);
      setShowEditModal(false);
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to update'); }
  };
  const handleDelete = async () => {
    try { await axios.delete(`/api/report-generator/${id}`); navigate('/report-generator'); }
    catch (err) { setError('Failed to delete'); }
  };
  const handleReanalyze = async () => {
    setAnalyzing(true);
    try { await axios.post(`/api/report-generator/${id}/analyze`); fetchData(); }
    catch (err) { setError(err.response?.data?.error || 'Failed to run AI analysis'); }
    finally { setAnalyzing(false); }
  };

  const getTypeBadge = (type) => {
    const labels = {
      quality_summary: 'Quality Summary',
      defect_analysis: 'Defect Analysis',
      inspection_report: 'Inspection Report',
      trend_report: 'Trend Report',
      compliance_report: 'Compliance Report',
      executive_summary: 'Executive Summary'
    };
    return <span className="badge badge-primary">{labels[type] || type}</span>;
  };

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  if (error || !item) return (
    <div className="main-content">
      <div className="error-message">{error || 'Item not found'}</div>
      <button className="btn btn-outline" onClick={() => navigate('/report-generator')}>Back to List</button>
    </div>
  );

  return (
    <div className="main-content">
      <div className="breadcrumb"><a href="/">Dashboard</a> / <a href="/report-generator">AI Report Generator</a> / {item.report_name}</div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{item.report_name}</h2>
            <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
              {getTypeBadge(item.report_type)}
              {item.ai_analysis && <span className="badge" style={{ background: '#6366f1', color: 'white' }}>AI Generated</span>}
            </div>
          </div>
          <div className="detail-actions">
            <button className="btn btn-secondary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Generating...' : 'Re-generate with AI'}</button>
            <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>Edit</button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>Delete</button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item"><div className="detail-label">Product</div><div className="detail-value">{item.product?.name || 'N/A'}</div></div>
          <div className="detail-item"><div className="detail-label">Report Type</div><div className="detail-value">{getTypeBadge(item.report_type)}</div></div>
          <div className="detail-item"><div className="detail-label">Scope</div><div className="detail-value">{item.report_scope || 'N/A'}</div></div>
        </div>

        {item.ai_analysis && <AIResultDisplay result={item.ai_analysis} title="AI Report Results" />}

        {!item.ai_analysis && (
          <div style={{ marginTop: '2rem', padding: '2rem', textAlign: 'center', background: '#f8fafc', borderRadius: '0.75rem', border: '2px dashed #e2e8f0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📄</div>
            <h3 style={{ marginBottom: '0.5rem', color: '#64748b' }}>No AI Analysis Yet</h3>
            <p style={{ color: '#94a3b8', marginBottom: '1rem' }}>Click the button below to generate an AI-powered report</p>
            <button className="btn btn-primary" onClick={handleReanalyze} disabled={analyzing}>{analyzing ? 'Generating...' : 'Generate AI Report'}</button>
          </div>
        )}
      </div>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit AI Report">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group"><label>Product</label><select name="product_id" value={formData.product_id || ''} onChange={handleInputChange}><option value="">Select a product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}</select></div>
          <div className="form-group"><label>Report Name</label><input type="text" name="report_name" value={formData.report_name || ''} onChange={handleInputChange} required /></div>
          <div className="form-group"><label>Report Type</label><select name="report_type" value={formData.report_type || 'quality_summary'} onChange={handleInputChange}>
            <option value="quality_summary">Quality Summary</option>
            <option value="defect_analysis">Defect Analysis</option>
            <option value="inspection_report">Inspection Report</option>
            <option value="trend_report">Trend Report</option>
            <option value="compliance_report">Compliance Report</option>
            <option value="executive_summary">Executive Summary</option>
          </select></div>
          <div className="form-group"><label>Report Scope</label><textarea name="report_scope" value={formData.report_scope || ''} onChange={handleInputChange} rows={4} /></div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>Cancel</button><button type="submit" className="btn btn-primary">Save Changes</button></div>
        </form>
      </Modal>

      <Modal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} title="Delete AI Report">
        <p>Are you sure you want to delete this AI report? This action cannot be undone.</p>
        <div className="modal-footer"><button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>Cancel</button><button className="btn btn-danger" onClick={handleDelete}>Delete</button></div>
      </Modal>
    </div>
  );
}

export default AIReportGeneratorDetail;
