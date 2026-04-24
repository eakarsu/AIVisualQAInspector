import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function DefectList() {
  const navigate = useNavigate();
  const [defects, setDefects] = useState([]);
  const [products, setProducts] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    inspection_id: '',
    defect_type: '',
    severity: 'medium',
    description: '',
    location: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [defectsRes, productsRes, inspectionsRes] = await Promise.all([
        axios.get('/api/defects'),
        axios.get('/api/products'),
        axios.get('/api/inspections')
      ]);
      setDefects(defectsRes.data);
      setProducts(productsRes.data);
      setInspections(inspectionsRes.data);
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

    try {
      const payload = { ...formData };
      if (!payload.inspection_id) {
        delete payload.inspection_id;
      }
      await axios.post('/api/defects', payload);
      setShowModal(false);
      setFormData({
        product_id: '',
        inspection_id: '',
        defect_type: '',
        severity: 'medium',
        description: '',
        location: ''
      });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create defect');
    }
  };

  const getSeverityBadge = (severity) => {
    return <span className={`badge severity-${severity}`}>{severity}</span>;
  };

  const columns = [
    { header: 'Defect Type', accessor: 'defect_type' },
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => row.product?.name || 'N/A'
    },
    {
      header: 'Severity',
      accessor: 'severity',
      render: (row) => getSeverityBadge(row.severity)
    },
    { header: 'Location', accessor: 'location' },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleDateString()
    }
  ];

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <a href="/">Dashboard</a> / Defects
          </div>
          <h2>Defects Tracking</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + Report Defect
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Table
        columns={columns}
        data={defects}
        onRowClick={(row) => navigate(`/defects/${row.id}`)}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Report New Defect"
      >
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Product</label>
            <select
              name="product_id"
              value={formData.product_id}
              onChange={handleInputChange}
              required
            >
              <option value="">Select a product</option>
              {products.map((product) => (
                <option key={product.id} value={product.id}>
                  {product.name} ({product.sku})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Related Inspection (Optional)</label>
            <select
              name="inspection_id"
              value={formData.inspection_id}
              onChange={handleInputChange}
            >
              <option value="">None</option>
              {inspections.map((inspection) => (
                <option key={inspection.id} value={inspection.id}>
                  #{inspection.id} - {inspection.product?.name} ({inspection.inspector_name})
                </option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Defect Type</label>
            <input
              type="text"
              name="defect_type"
              value={formData.defect_type}
              onChange={handleInputChange}
              placeholder="e.g., Scratch, Dent, Crack"
              required
            />
          </div>
          <div className="form-group">
            <label>Severity</label>
            <select
              name="severity"
              value={formData.severity}
              onChange={handleInputChange}
              required
            >
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>Location</label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Upper right corner"
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={3}
              placeholder="Detailed description of the defect"
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Report Defect
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default DefectList;
