import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function QualityInspectorList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '', inspection_name: '', batch_number: '', inspection_type: 'Final QC', inspector_name: '', parameters: ''
  });
  const [formError, setFormError] = useState('');

  const loadSampleData = () => {
    setFormData({
      product_id: products.length > 0 ? products[0].id : '',
      inspection_name: 'Final Assembly Quality Check - Widget Pro',
      batch_number: 'BATCH-2024-0542',
      inspection_type: 'Final QC',
      inspector_name: 'John Smith',
      parameters: '{"tolerance": "0.05mm", "surface_finish": "Ra 0.8", "hardness": "HRC 58-62", "coating_thickness": "25-35 microns"}'
    });
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, productsRes] = await Promise.all([axios.get('/api/quality-inspector'), axios.get('/api/products')]);
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
      if (payload.parameters) {
        try { payload.parameters = JSON.parse(payload.parameters); } catch { payload.parameters = { notes: payload.parameters }; }
      }
      await axios.post('/api/quality-inspector', payload);
      setShowModal(false);
      setFormData({ product_id: '', inspection_name: '', batch_number: '', inspection_type: 'Final QC', inspector_name: '', parameters: '' });
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to create inspection'); } finally { setSubmitting(false); }
  };

  const getStatusBadge = (status) => {
    const colors = { passed: 'badge-success', failed: 'badge-danger', pending: 'badge-secondary', in_progress: 'badge-warning', needs_review: 'badge-info' };
    return <span className={`badge ${colors[status] || 'badge-secondary'}`}>{status?.replace('_', ' ')}</span>;
  };

  const getScoreBadge = (score) => {
    if (!score) return <span className="badge badge-secondary">-</span>;
    const color = score >= 90 ? '#22c55e' : score >= 75 ? '#f59e0b' : '#ef4444';
    return <span style={{ color, fontWeight: '600' }}>{score}%</span>;
  };

  const columns = [
    { header: 'Inspection Name', accessor: 'inspection_name' },
    { header: 'Product', accessor: 'product', render: (row) => row.product?.name || 'N/A' },
    { header: 'Batch #', accessor: 'batch_number' },
    { header: 'Type', accessor: 'inspection_type' },
    { header: 'Status', accessor: 'status', render: (row) => getStatusBadge(row.status) },
    { header: 'Score', accessor: 'quality_score', render: (row) => getScoreBadge(row.quality_score) },
    { header: 'AI', accessor: 'ai_analysis', render: (row) => row.ai_analysis ? <span className="badge badge-success">✓</span> : <span className="badge badge-secondary">-</span> }
  ];

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><a href="/">Dashboard</a> / AI Quality Inspector</div>
          <h2>AI Quality Inspector</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Comprehensive AI quality inspection for manufacturing</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Inspection</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <Table columns={columns} data={items} onRowClick={(row) => navigate(`/quality-inspector/${row.id}`)} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Quality Inspection">
        {formError && <div className="error-message">{formError}</div>}
        <button type="button" className="btn btn-outline" onClick={loadSampleData} style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
          Load Sample Data
        </button>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Product *</label><select name="product_id" value={formData.product_id} onChange={handleInputChange} required><option value="">Select a product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
          <div className="form-group"><label>Inspection Name *</label><input type="text" name="inspection_name" value={formData.inspection_name} onChange={handleInputChange} placeholder="e.g., Final Assembly Inspection" required /></div>
          <div className="form-group"><label>Batch Number *</label><input type="text" name="batch_number" value={formData.batch_number} onChange={handleInputChange} placeholder="e.g., BATCH-2024-001" required /></div>
          <div className="form-group"><label>Inspection Type *</label><select name="inspection_type" value={formData.inspection_type} onChange={handleInputChange} required>
            <option value="Final QC">Final QC</option><option value="Incoming">Incoming Inspection</option><option value="In-Process">In-Process</option><option value="Visual">Visual Inspection</option><option value="Functional">Functional Test</option><option value="NDT">Non-Destructive Test</option>
          </select></div>
          <div className="form-group"><label>Inspector Name</label><input type="text" name="inspector_name" value={formData.inspector_name} onChange={handleInputChange} placeholder="Inspector's name" /></div>
          <div className="form-group"><label>Parameters (Optional - JSON or text)</label><textarea name="parameters" value={formData.parameters} onChange={handleInputChange} placeholder='{"tolerance": "0.01mm", "surface_finish": "Ra 0.8"}' rows={3} /></div>
          <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#065f46' }}>✅ AI will perform a comprehensive quality assessment and provide detailed findings and recommendations.</p>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Inspecting...' : 'Start AI Inspection'}</button></div>
        </form>
      </Modal>
    </div>
  );
}

export default QualityInspectorList;
