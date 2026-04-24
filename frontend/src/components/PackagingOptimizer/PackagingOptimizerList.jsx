import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function PackagingOptimizerList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '', optimization_name: '', current_packaging: '', product_weight: '', fragility_level: 'medium', shipping_requirements: '', optimization_goals: ''
  });
  const [formError, setFormError] = useState('');

  const loadSampleData = () => {
    setFormData({
      product_id: products.length > 0 ? products[0].id : '',
      optimization_name: 'Eco-Friendly Electronics Packaging Redesign',
      current_packaging: 'Standard corrugated cardboard box with expanded polystyrene foam inserts and plastic bubble wrap',
      product_weight: '3.2',
      fragility_level: 'high',
      shipping_requirements: 'Must withstand international air and ground shipping. Temperature sensitive between -10C and 50C. Keep upright during transit.',
      optimization_goals: 'Cost reduction, Sustainability, Better protection, Reduce packaging volume'
    });
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, productsRes] = await Promise.all([axios.get('/api/packaging-optimizer'), axios.get('/api/products')]);
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
      if (payload.product_weight) payload.product_weight = parseFloat(payload.product_weight);
      if (payload.optimization_goals) payload.optimization_goals = payload.optimization_goals.split(',').map(g => g.trim());
      await axios.post('/api/packaging-optimizer', payload);
      setShowModal(false);
      setFormData({ product_id: '', optimization_name: '', current_packaging: '', product_weight: '', fragility_level: 'medium', shipping_requirements: '', optimization_goals: '' });
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to create optimization'); } finally { setSubmitting(false); }
  };

  const getFragilityBadge = (level) => {
    const colors = { very_high: 'severity-critical', high: 'severity-high', medium: 'severity-medium', low: 'severity-low' };
    return <span className={`badge ${colors[level] || 'badge-secondary'}`}>{level?.replace('_', ' ')}</span>;
  };

  const columns = [
    { header: 'Optimization Name', accessor: 'optimization_name' },
    { header: 'Product', accessor: 'product', render: (row) => row.product?.name || 'N/A' },
    { header: 'Current Packaging', accessor: 'current_packaging' },
    { header: 'Weight', accessor: 'product_weight', render: (row) => row.product_weight ? `${row.product_weight} kg` : 'N/A' },
    { header: 'Fragility', accessor: 'fragility_level', render: (row) => getFragilityBadge(row.fragility_level) },
    { header: 'AI Status', accessor: 'ai_analysis', render: (row) => row.ai_analysis ? <span className="badge badge-success">Optimized</span> : <span className="badge badge-secondary">Pending</span> }
  ];

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><a href="/">Dashboard</a> / AI Packaging Optimizer</div>
          <h2>AI Packaging Optimizer</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Smart packaging optimization for manufacturing</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Optimization</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <Table columns={columns} data={items} onRowClick={(row) => navigate(`/packaging-optimizer/${row.id}`)} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Packaging Optimization">
        {formError && <div className="error-message">{formError}</div>}
        <button type="button" className="btn btn-outline" onClick={loadSampleData} style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
          Load Sample Data
        </button>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Product *</label><select name="product_id" value={formData.product_id} onChange={handleInputChange} required><option value="">Select a product</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
          <div className="form-group"><label>Optimization Name *</label><input type="text" name="optimization_name" value={formData.optimization_name} onChange={handleInputChange} placeholder="e.g., Sustainable Packaging Solution" required /></div>
          <div className="form-group"><label>Current Packaging *</label><input type="text" name="current_packaging" value={formData.current_packaging} onChange={handleInputChange} placeholder="e.g., Cardboard box with foam inserts" required /></div>
          <div className="form-group"><label>Product Weight (kg)</label><input type="number" step="0.01" name="product_weight" value={formData.product_weight} onChange={handleInputChange} placeholder="e.g., 2.5" /></div>
          <div className="form-group"><label>Fragility Level *</label><select name="fragility_level" value={formData.fragility_level} onChange={handleInputChange} required>
            <option value="very_high">Very High (Extremely Fragile)</option><option value="high">High (Fragile)</option><option value="medium">Medium (Standard)</option><option value="low">Low (Robust)</option>
          </select></div>
          <div className="form-group"><label>Shipping Requirements</label><textarea name="shipping_requirements" value={formData.shipping_requirements} onChange={handleInputChange} placeholder="Any special shipping requirements (temperature, orientation, etc.)" rows={2} /></div>
          <div className="form-group"><label>Optimization Goals (comma separated)</label><input type="text" name="optimization_goals" value={formData.optimization_goals} onChange={handleInputChange} placeholder="e.g., Cost reduction, Sustainability, Better protection" /></div>
          <div style={{ background: '#ffedd5', border: '1px solid #fed7aa', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#9a3412' }}>📦 AI will analyze your product and suggest optimal packaging solutions considering cost, protection, sustainability, and logistics efficiency.</p>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Optimizing...' : 'Optimize with AI'}</button></div>
        </form>
      </Modal>
    </div>
  );
}

export default PackagingOptimizerList;
