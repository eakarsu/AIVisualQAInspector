import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';

function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await axios.get(`/api/products/${id}`);
      setProduct(response.data);
      setFormData(response.data);
    } catch (err) {
      setError('Failed to fetch product');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setFormError('');

    try {
      await axios.put(`/api/products/${id}`, formData);
      setShowEditModal(false);
      fetchProduct();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update product');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/products/${id}`);
      navigate('/products');
    } catch (err) {
      setError('Failed to delete product');
    }
  };

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="main-content">
        <div className="error-message">{error || 'Product not found'}</div>
        <button className="btn btn-outline" onClick={() => navigate('/products')}>
          Back to Products
        </button>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="breadcrumb">
        <a href="/">Dashboard</a> / <a href="/products">Products</a> / {product.name}
      </div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{product.name}</h2>
            <span className="badge badge-info">{product.category}</span>
          </div>
          <div className="detail-actions">
            <button className="btn btn-primary" onClick={() => setShowEditModal(true)}>
              Edit
            </button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              Delete
            </button>
          </div>
        </div>

        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">SKU</div>
            <div className="detail-value">{product.sku}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Category</div>
            <div className="detail-value">{product.category}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Created</div>
            <div className="detail-value">
              {new Date(product.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {product.description && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Description</div>
            <div className="detail-value">{product.description}</div>
          </div>
        )}

        {product.image_url && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Product Image</div>
            <img
              src={product.image_url}
              alt={product.name}
              style={{ maxWidth: '300px', borderRadius: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Product"
      >
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              name="name"
              value={formData.name || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>SKU</label>
            <input
              type="text"
              name="sku"
              value={formData.sku || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Category</label>
            <input
              type="text"
              name="category"
              value={formData.category || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea
              name="description"
              value={formData.description || ''}
              onChange={handleInputChange}
              rows={3}
            />
          </div>
          <div className="form-group">
            <label>Image URL</label>
            <input
              type="url"
              name="image_url"
              value={formData.image_url || ''}
              onChange={handleInputChange}
            />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowEditModal(false)}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              Save Changes
            </button>
          </div>
        </form>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Product"
      >
        <p>Are you sure you want to delete "{product.name}"? This action cannot be undone.</p>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </Modal>
    </div>
  );
}

export default ProductDetail;
