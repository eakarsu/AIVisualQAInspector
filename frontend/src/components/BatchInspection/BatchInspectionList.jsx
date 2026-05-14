import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function BatchInspectionList() {
  const navigate = useNavigate();
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [productId, setProductId] = useState('');
  const [files, setFiles] = useState([]);
  const [formError, setFormError] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1, total: 0 });

  useEffect(() => {
    fetchData();
  }, [page]);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [itemsRes, productsRes] = await Promise.all([
        axios.get(`/api/batch-inspection?page=${page}&limit=20`),
        axios.get('/api/products')
      ]);
      setItems(itemsRes.data.data || itemsRes.data);
      if (itemsRes.data.pagination) setPagination(itemsRes.data.pagination);
      setProducts(productsRes.data);
    } catch (err) {
      setError('Failed to fetch batches');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError('');

    if (!name.trim()) {
      setFormError('Batch name is required');
      return;
    }
    if (files.length === 0) {
      setFormError('Please select at least one image');
      return;
    }
    if (files.length > 20) {
      setFormError('Maximum 20 images per batch');
      return;
    }

    setSubmitting(true);
    const formData = new FormData();
    formData.append('name', name);
    if (productId) formData.append('product_id', productId);
    files.forEach(f => formData.append('images', f));

    try {
      await axios.post('/api/batch-inspection', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setShowModal(false);
      setName('');
      setProductId('');
      setFiles([]);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create batch');
    } finally {
      setSubmitting(false);
    }
  };

  const getStatusBadge = (status) => {
    const colorMap = {
      completed: 'success',
      processing: 'warning',
      failed: 'danger',
      pending: 'secondary'
    };
    return <span className={`badge badge-${colorMap[status] || 'secondary'}`}>{status}</span>;
  };

  const columns = [
    { header: 'Name', accessor: 'name' },
    {
      header: 'Product',
      accessor: 'product',
      render: (row) => row.product?.name || 'N/A'
    },
    { header: 'Total', accessor: 'total_images' },
    {
      header: 'Processed',
      accessor: 'processed_images',
      render: (row) => `${row.processed_images || 0} / ${row.total_images || 0}`
    },
    {
      header: 'Status',
      accessor: 'status',
      render: (row) => getStatusBadge(row.status)
    },
    {
      header: 'Created',
      accessor: 'created_at',
      render: (row) => new Date(row.created_at).toLocaleString()
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
            <a href="/">Dashboard</a> / Batch Inspection
          </div>
          <h2>Batch Inspection</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Upload up to 20 images per batch for parallel AI defect analysis
          </p>
        </div>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Batch
        </button>
      </div>

      {error && <div className="error-message">{error}</div>}

      <Table
        columns={columns}
        data={items}
        onRowClick={(row) => navigate(`/batch-inspection/${row.id}`)}
      />

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ padding: '0.5rem 1rem' }}>Page {page} of {pagination.totalPages}</span>
          <button className="btn btn-outline" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="New Batch Inspection"
      >
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Batch Name *</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g., Production Line A — 2026-05-02 Morning"
              required
            />
          </div>
          <div className="form-group">
            <label>Product (Optional)</label>
            <select value={productId} onChange={(e) => setProductId(e.target.value)}>
              <option value="">Select a product</option>
              {products.map(p => (
                <option key={p.id} value={p.id}>{p.name} ({p.sku})</option>
              ))}
            </select>
          </div>
          <div className="form-group">
            <label>Images (up to 20) *</label>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={(e) => setFiles(Array.from(e.target.files).slice(0, 20))}
            />
            {files.length > 0 && (
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
                {files.length} file(s) selected
              </p>
            )}
          </div>
          <div style={{
            background: '#f0f9ff',
            border: '1px solid #bae6fd',
            borderRadius: '0.5rem',
            padding: '1rem',
            marginBottom: '1rem'
          }}>
            <p style={{ margin: 0, fontSize: '0.875rem', color: '#0369a1' }}>
              🤖 Each image will be analyzed by Claude vision in the background. Aggregate report is generated when complete.
            </p>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowModal(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Uploading...' : 'Start Batch Analysis'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default BatchInspectionList;
