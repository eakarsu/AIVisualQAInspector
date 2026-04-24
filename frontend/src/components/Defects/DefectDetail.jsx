import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';

function DefectDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [defect, setDefect] = useState(null);
  const [products, setProducts] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [defectRes, productsRes, inspectionsRes] = await Promise.all([
        axios.get(`/api/defects/${id}`),
        axios.get('/api/products'),
        axios.get('/api/inspections')
      ]);
      setDefect(defectRes.data);
      setProducts(productsRes.data);
      setInspections(inspectionsRes.data);
      setFormData(defectRes.data);
    } catch (err) {
      setError('Failed to fetch defect');
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
      const payload = { ...formData };
      if (!payload.inspection_id) {
        payload.inspection_id = null;
      }
      await axios.put(`/api/defects/${id}`, payload);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update defect');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/defects/${id}`);
      navigate('/defects');
    } catch (err) {
      setError('Failed to delete defect');
    }
  };

  const getSeverityBadge = (severity) => {
    return <span className={`badge severity-${severity}`}>{severity}</span>;
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

  if (error || !defect) {
    return (
      <div className="main-content">
        <div className="error-message">{error || 'Defect not found'}</div>
        <button className="btn btn-outline" onClick={() => navigate('/defects')}>
          Back to Defects
        </button>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="breadcrumb">
        <a href="/">Dashboard</a> / <a href="/defects">Defects</a> / {defect.defect_type}
      </div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">{defect.defect_type}</h2>
            {getSeverityBadge(defect.severity)}
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
            <div className="detail-label">Product</div>
            <div className="detail-value">
              {defect.product?.name || 'N/A'}
              {defect.product?.sku && <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                ({defect.product.sku})
              </span>}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Severity</div>
            <div className="detail-value">{getSeverityBadge(defect.severity)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Location</div>
            <div className="detail-value">{defect.location || 'Not specified'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Created</div>
            <div className="detail-value">
              {new Date(defect.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {defect.inspection && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Related Inspection</div>
            <div className="detail-value">
              <a
                href={`/inspections/${defect.inspection.id}`}
                style={{ color: 'var(--primary)' }}
              >
                Inspection #{defect.inspection.id} - {defect.inspection.inspector_name}
              </a>
            </div>
          </div>
        )}

        {defect.description && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Description</div>
            <div className="detail-value">{defect.description}</div>
          </div>
        )}

        {defect.image_url && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Defect Image</div>
            <img
              src={defect.image_url}
              alt={defect.defect_type}
              style={{ maxWidth: '400px', borderRadius: '0.5rem', marginTop: '0.5rem' }}
            />
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Defect"
      >
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleUpdate}>
          <div className="form-group">
            <label>Product</label>
            <select
              name="product_id"
              value={formData.product_id || ''}
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
              value={formData.inspection_id || ''}
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
              value={formData.defect_type || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Severity</label>
            <select
              name="severity"
              value={formData.severity || 'medium'}
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
              value={formData.location || ''}
              onChange={handleInputChange}
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
        title="Delete Defect"
      >
        <p>Are you sure you want to delete this defect record? This action cannot be undone.</p>
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

export default DefectDetail;
