import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function SeverityScorerList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    issue_name: '',
    issue_description: '',
    severity_level: 'medium'
  });
  const [formError, setFormError] = useState('');

  const loadSampleData = () => {
    setFormData({
      product_id: products.length > 0 ? products[0].id : '',
      issue_name: 'Overheating Motor in Assembly Unit',
      issue_description: 'The electric motor in assembly unit #5 is reaching temperatures of 95C during normal operation, exceeding the 80C threshold. This has caused two unplanned shutdowns in the past week and poses a fire risk. The motor bearings show signs of excessive wear and the cooling fan appears to be underperforming.',
      severity_level: 'high'
    });
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, productsRes] = await Promise.all([
        axios.get('/api/severity-scorer'),
        axios.get('/api/products')
      ]);
      setItems(itemsRes.data);
      setProducts(productsRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      await axios.post('/api/severity-scorer', formData);
      setShowModal(false);
      setFormData({ product_id: '', issue_name: '', issue_description: '', severity_level: 'medium' });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create severity score');
    } finally {
      setSubmitting(false);
    }
  };

  const getScoreBadge = (score) => {
    if (!score) return <span className="badge badge-secondary">Pending</span>;
    const color = score >= 80 ? '#ef4444' : score >= 60 ? '#f59e0b' : score >= 40 ? '#eab308' : '#22c55e';
    return (
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
        <div style={{ width: '50px', height: '6px', background: '#e2e8f0', borderRadius: '3px', overflow: 'hidden' }}>
          <div style={{ width: `${score}%`, height: '100%', background: color, borderRadius: '3px' }} />
        </div>
        <span style={{ color, fontWeight: '600', fontSize: '0.875rem' }}>{score}</span>
      </div>
    );
  };

  const columns = [
    { header: 'Issue Name', accessor: 'issue_name' },
    { header: 'Product', accessor: 'product', render: (row) => row.product?.name || 'N/A' },
    { header: 'Severity Level', accessor: 'severity_level', render: (row) => <span className={`badge severity-${row.severity_level}`}>{row.severity_level}</span> },
    { header: 'Score', accessor: 'severity_score', render: (row) => getScoreBadge(row.severity_score) },
    { header: 'AI Status', accessor: 'ai_analysis', render: (row) => row.ai_analysis ? <span className="badge badge-success">Analyzed</span> : <span className="badge badge-secondary">Pending</span> }
  ];

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><a href="/">Dashboard</a> / AI Severity Scorer</div>
          <h2>AI Severity Scorer</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Intelligent severity assessment and scoring</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Assessment</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <Table columns={columns} data={items} onRowClick={(row) => navigate(`/severity-scorer/${row.id}`)} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="New Severity Assessment">
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
            <label>Issue Name *</label>
            <input type="text" name="issue_name" value={formData.issue_name} onChange={handleInputChange} placeholder="e.g., Power Supply Failure" required />
          </div>
          <div className="form-group">
            <label>Issue Description *</label>
            <textarea name="issue_description" value={formData.issue_description} onChange={handleInputChange} placeholder="Describe the issue in detail for AI analysis..." rows={4} required />
          </div>
          <div className="form-group">
            <label>Initial Severity Level</label>
            <select name="severity_level" value={formData.severity_level} onChange={handleInputChange}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div style={{ background: '#fef3c7', border: '1px solid #fcd34d', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#92400e' }}>🤖 AI will analyze the impact and provide a comprehensive severity score when you submit.</p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Analyzing...' : 'Score with AI'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default SeverityScorerList;
