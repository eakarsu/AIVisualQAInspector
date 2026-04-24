import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function DefectClassifierList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    defect_name: '',
    defect_description: '',
    category: '',
    sub_category: ''
  });
  const [formError, setFormError] = useState('');

  const loadSampleData = () => {
    setFormData({
      product_id: products.length > 0 ? products[0].id : '',
      defect_name: 'Hairline Crack on PCB Board',
      defect_description: 'A thin hairline crack was observed on the printed circuit board near the main processor chip. The crack extends approximately 2mm along the solder trace and may cause intermittent connectivity issues. Found during visual inspection of Batch #2024-087.',
      category: '',
      sub_category: ''
    });
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [itemsRes, productsRes] = await Promise.all([
        axios.get('/api/defect-classifier'),
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
      await axios.post('/api/defect-classifier', formData);
      setShowModal(false);
      setFormData({
        product_id: '',
        defect_name: '',
        defect_description: '',
        category: '',
        sub_category: ''
      });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create classification');
    } finally {
      setSubmitting(false);
    }
  };

  const getConfidenceBadge = (score) => {
    if (!score) return <span className="badge badge-secondary">Pending</span>;
    const color = score >= 90 ? 'success' : score >= 75 ? 'warning' : 'danger';
    return <span className={`badge badge-${color}`}>{score}%</span>;
  };

  const columns = [
    { header: 'Defect Name', accessor: 'defect_name' },
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => row.product?.name || 'N/A'
    },
    { header: 'Category', accessor: 'category' },
    { header: 'Sub-Category', accessor: 'sub_category' },
    {
      header: 'Confidence',
      accessor: 'confidence_score',
      render: (row) => getConfidenceBadge(row.confidence_score)
    },
    {
      header: 'AI Status',
      accessor: 'ai_analysis',
      render: (row) => row.ai_analysis ? (
        <span className="badge badge-success">Analyzed</span>
      ) : (
        <span className="badge badge-secondary">Pending</span>
      )
    }
  ];

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-spinner"><div className="spinner"></div></div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <a href="/">Dashboard</a> / AI Defect Classifier
          </div>
          <h2>AI Defect Classifier</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            AI-powered defect classification and categorization
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Classification
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Table
        columns={columns}
        data={items}
        onRowClick={(row) => navigate(`/defect-classifier/${row.id}`)}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Defect Classification"
      >
        {formError && <div className="error-message">{formError}</div>}
        <button type="button" className="btn btn-outline" onClick={loadSampleData} style={{ marginBottom: '1rem', fontSize: '0.8rem' }}>
          Load Sample Data
        </button>
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product (Optional)</label>
            <select name="product_id" value={formData.product_id} onChange={handleInputChange}>
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Defect Name *</label>
            <input
              type="text"
              name="defect_name"
              value={formData.defect_name}
              onChange={handleInputChange}
              placeholder="e.g., Surface Crack, Solder Bridge"
              required
            />
          </div>
          <div className="form-group">
            <label>Defect Description *</label>
            <textarea
              name="defect_description"
              value={formData.defect_description}
              onChange={handleInputChange}
              placeholder="Describe the defect in detail for AI analysis..."
              rows={4}
              required
            />
          </div>
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369a1' }}>
              🤖 AI will automatically classify this defect when you submit. The category and sub-category fields below are optional - AI will suggest appropriate values.
            </p>
          </div>
          <div className="form-group">
            <label>Category (Optional - AI will suggest)</label>
            <input
              type="text"
              name="category"
              value={formData.category}
              onChange={handleInputChange}
              placeholder="e.g., Surface Defects, Electrical Defects"
            />
          </div>
          <div className="form-group">
            <label>Sub-Category (Optional - AI will suggest)</label>
            <input
              type="text"
              name="sub_category"
              value={formData.sub_category}
              onChange={handleInputChange}
              placeholder="e.g., Scratches, Short Circuits"
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Analyzing with AI...' : 'Classify with AI'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DefectClassifierList;
