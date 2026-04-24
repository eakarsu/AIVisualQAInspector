import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function RootCauseList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({ product_id: '', problem_name: '', problem_description: '' });
  const [formError, setFormError] = useState('');

  const loadSampleData = () => {
    setFormData({
      product_id: products.length > 0 ? products[0].id : '',
      problem_name: 'High Rejection Rate in Painting Line',
      problem_description: 'The painting production line has experienced a 15% rejection rate over the last 2 weeks, up from the normal 3%. Defects include orange peel texture, paint runs, and uneven coating thickness. The issue started after a supplier change for the primer material. Temperature and humidity in the paint booth are within spec. Multiple operators have reported the same issues across different shifts.'
    });
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, productsRes] = await Promise.all([axios.get('/api/root-cause'), axios.get('/api/products')]);
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
      await axios.post('/api/root-cause', formData);
      setShowModal(false);
      setFormData({ product_id: '', problem_name: '', problem_description: '' });
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to create analysis'); } finally { setSubmitting(false); }
  };

  const columns = [
    { header: 'Problem Name', accessor: 'problem_name' },
    { header: 'Product', accessor: 'product', render: (row) => row.product?.name || 'N/A' },
    { header: 'Root Causes', accessor: 'root_causes', render: (row) => row.root_causes?.length || 0 },
    { header: 'Corrective Actions', accessor: 'corrective_actions', render: (row) => row.corrective_actions?.length || 0 },
    { header: 'AI Status', accessor: 'ai_analysis', render: (row) => row.ai_analysis ? <span className="badge badge-success">Analyzed</span> : <span className="badge badge-secondary">Pending</span> },
    { header: 'Created', accessor: 'created_at', render: (row) => new Date(row.created_at).toLocaleDateString() }
  ];

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><a href="/">Dashboard</a> / AI Root Cause Analyzer</div>
          <h2>AI Root Cause Analyzer</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>5 Whys and Fishbone analysis powered by AI</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Analysis</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <Table columns={columns} data={items} onRowClick={(row) => navigate(`/root-cause/${row.id}`)} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Root Cause Analysis">
        {formError && <div className="error-message">{formError}</div>}
        <button type="button" className="btn btn-outline" onClick={loadSampleData} style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
          Load Sample Data
        </button>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product (Optional)</label>
            <select name="product_id" value={formData.product_id} onChange={handleInputChange}>
              <option value="">Select a product</option>
              {products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Problem Name *</label>
            <input type="text" name="problem_name" value={formData.problem_name} onChange={handleInputChange} placeholder="e.g., High Defect Rate in Assembly Line 3" required />
          </div>
          <div className="form-group">
            <label>Problem Description *</label>
            <textarea name="problem_description" value={formData.problem_description} onChange={handleInputChange} placeholder="Describe the problem in detail. Include symptoms, when it started, affected areas, frequency, etc." rows={5} required />
          </div>
          <div style={{ background: '#fce7f3', border: '1px solid #f9a8d4', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#9d174d' }}>🔬 AI will perform 5 Whys analysis, identify contributing factors using the Fishbone method, and suggest corrective actions.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Analyzing...' : 'Analyze with AI'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default RootCauseList;
