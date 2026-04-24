import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function InspectionList() {
  const navigate = useNavigate();
  const [inspections, setInspections] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    product_id: '',
    inspector_name: '',
    status: 'pending',
    notes: ''
  });
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [inspectionsRes, productsRes] = await Promise.all([
        axios.get('/api/inspections'),
        axios.get('/api/products')
      ]);
      setInspections(inspectionsRes.data);
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

    try {
      await axios.post('/api/inspections', formData);
      setShowModal(false);
      setFormData({ product_id: '', inspector_name: '', status: 'pending', notes: '' });
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create inspection');
    }
  };

  const getStatusBadge = (status) => {
    const statusMap = {
      pending: 'badge-secondary',
      in_progress: 'badge-info',
      completed: 'badge-success',
      failed: 'badge-danger'
    };
    return <span className={`badge ${statusMap[status] || 'badge-secondary'}`}>{status}</span>;
  };

  const columns = [
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => row.product?.name || 'N/A'
    },
    { header: 'Inspector', accessor: 'inspector_name' },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
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
            <a href="/">Dashboard</a> / Inspections
          </div>
          <h2>Inspections</h2>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Inspection
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Table
        columns={columns}
        data={inspections}
        onRowClick={(row) => navigate(`/inspections/${row.id}`)}
      />

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Create New Inspection"
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
            <label>Inspector Name</label>
            <input
              type="text"
              name="inspector_name"
              value={formData.inspector_name}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
            >
              <option value="pending">Pending</option>
              <option value="in_progress">In Progress</option>
              <option value="completed">Completed</option>
              <option value="failed">Failed</option>
            </select>
          </div>
          <div className="form-group">
            <label>Notes</label>
            <textarea
              name="notes"
              value={formData.notes}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Create Inspection
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default InspectionList;
