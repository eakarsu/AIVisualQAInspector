import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function AIReportGeneratorList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '', report_name: '', report_type: 'quality_summary', report_scope: ''
  });
  const [formError, setFormError] = useState('');

  const loadSampleData = () => {
    setFormData({
      product_id: products.length > 0 ? products[0].id : '',
      report_name: 'Q1 2025 Quality Performance Report',
      report_type: 'quality_summary',
      report_scope: 'Comprehensive analysis of product quality metrics, defect rates, inspection results, and manufacturing process efficiency for the first quarter. Include trend comparisons with previous quarter and actionable recommendations for improvement.'
    });
  };

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, productsRes] = await Promise.all([axios.get('/api/report-generator'), axios.get('/api/products')]);
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
      await axios.post('/api/report-generator', formData);
      setShowModal(false);
      setFormData({ product_id: '', report_name: '', report_type: 'quality_summary', report_scope: '' });
      fetchData();
    } catch (err) { setFormError(err.response?.data?.error || 'Failed to generate report'); } finally { setSubmitting(false); }
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

  const columns = [
    { header: 'Report Name', accessor: 'report_name' },
    { header: 'Product', accessor: 'product', render: (row) => row.product?.name || 'N/A' },
    { header: 'Type', accessor: 'report_type', render: (row) => getTypeBadge(row.report_type) },
    { header: 'AI Status', accessor: 'ai_analysis', render: (row) => row.ai_analysis ? <span className="badge badge-success">Generated</span> : <span className="badge badge-secondary">Pending</span> }
  ];

  if (loading) return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb"><a href="/">Dashboard</a> / AI Report Generator</div>
          <h2>AI Report Generator</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>AI-powered comprehensive report generation</p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>+ New Report</button>
      </div>
      {error && <div className="error-message">{error}</div>}
      <Table columns={columns} data={items} onRowClick={(row) => navigate(`/report-generator/${row.id}`)} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Generate New AI Report">
        {formError && <div className="error-message">{formError}</div>}
        <button type="button" className="btn btn-outline" onClick={loadSampleData} style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
          Load Sample Data
        </button>
        <form onSubmit={handleSubmit}>
          <div className="form-group"><label>Product</label><select name="product_id" value={formData.product_id} onChange={handleInputChange}><option value="">Select a product (optional)</option>{products.map((p) => <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>)}</select></div>
          <div className="form-group"><label>Report Name *</label><input type="text" name="report_name" value={formData.report_name} onChange={handleInputChange} placeholder="e.g., Q1 Quality Performance Report" required /></div>
          <div className="form-group"><label>Report Type *</label><select name="report_type" value={formData.report_type} onChange={handleInputChange} required>
            <option value="quality_summary">Quality Summary</option>
            <option value="defect_analysis">Defect Analysis</option>
            <option value="inspection_report">Inspection Report</option>
            <option value="trend_report">Trend Report</option>
            <option value="compliance_report">Compliance Report</option>
            <option value="executive_summary">Executive Summary</option>
          </select></div>
          <div className="form-group"><label>Report Scope</label><textarea name="report_scope" value={formData.report_scope} onChange={handleInputChange} placeholder="Describe what the report should cover, key areas of focus, and any specific metrics or data to include..." rows={4} /></div>
          <div style={{ background: '#eef2ff', border: '1px solid #c7d2fe', borderRadius: '0.5rem', padding: '1rem', marginBottom: '1rem' }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#4338ca' }}>AI will generate a comprehensive report with executive summary, detailed findings, metrics analysis, recommendations, and action items.</p>
          </div>
          <div className="modal-footer"><button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button><button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Generating...' : 'Generate with AI'}</button></div>
        </form>
      </Modal>
    </div>
  );
}

export default AIReportGeneratorList;
