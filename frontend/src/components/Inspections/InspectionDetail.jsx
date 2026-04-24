import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';
import AIResultDisplay from '../AIAnalysis/AIResultDisplay';

function InspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [inspection, setInspection] = useState(null);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [formData, setFormData] = useState({});
  const [formError, setFormError] = useState('');

  // AI Analysis state
  const [selectedFile, setSelectedFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState(null);
  const [aiError, setAiError] = useState('');
  const fileInputRef = useRef(null);

  // Report generation state
  const [generatingReport, setGeneratingReport] = useState(false);

  useEffect(() => {
    fetchData();
  }, [id]);

  const fetchData = async () => {
    try {
      const [inspectionRes, productsRes] = await Promise.all([
        axios.get(`/api/inspections/${id}`),
        axios.get('/api/products')
      ]);
      setInspection(inspectionRes.data);
      setProducts(productsRes.data);
      setFormData(inspectionRes.data);
      // Load existing AI analysis if present
      if (inspectionRes.data.ai_analysis) {
        setAiResult({ analysis: inspectionRes.data.ai_analysis });
      }
    } catch (err) {
      setError('Failed to fetch inspection');
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
      await axios.put(`/api/inspections/${id}`, formData);
      setShowEditModal(false);
      fetchData();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to update inspection');
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/inspections/${id}`);
      navigate('/inspections');
    } catch (err) {
      setError('Failed to delete inspection');
    }
  };

  // Handle file selection for AI analysis
  const handleFileSelect = (file) => {
    if (!file) return;

    const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validTypes.includes(file.type)) {
      setAiError('Invalid file type. Please upload a JPEG, PNG, GIF, or WebP image.');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setAiError('File too large. Maximum size is 10MB.');
      return;
    }

    setSelectedFile(file);
    setAiError('');
    setAiResult(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
  };

  // Run AI analysis on the uploaded image
  const handleAnalyze = async () => {
    if (!selectedFile) return;

    setAnalyzing(true);
    setAiError('');

    const formData = new FormData();
    formData.append('image', selectedFile);

    try {
      const response = await axios.post('/api/ai/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      setAiResult(response.data);

      // Save AI analysis to the inspection
      await axios.put(`/api/inspections/${id}`, {
        ai_analysis: response.data.analysis
      });

      fetchData();
    } catch (err) {
      setAiError(err.response?.data?.error || 'Failed to analyze image.');
    } finally {
      setAnalyzing(false);
    }
  };

  // Generate report for this inspection
  const handleGenerateReport = async () => {
    setGeneratingReport(true);
    try {
      const response = await axios.post(`/api/reports/generate/${id}`);
      navigate(`/reports/${response.data.id}`);
    } catch (err) {
      setError(err.response?.data?.error || 'Failed to generate report');
      setGeneratingReport(false);
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

  if (loading) {
    return (
      <div className="main-content">
        <div className="loading-spinner">
          <div className="spinner"></div>
        </div>
      </div>
    );
  }

  if (error || !inspection) {
    return (
      <div className="main-content">
        <div className="error-message">{error || 'Inspection not found'}</div>
        <button className="btn btn-outline" onClick={() => navigate('/inspections')}>
          Back to Inspections
        </button>
      </div>
    );
  }

  return (
    <div className="main-content">
      <div className="breadcrumb">
        <a href="/">Dashboard</a> / <a href="/inspections">Inspections</a> / Inspection #{inspection.id}
      </div>

      <div className="detail-container">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">
              Inspection #{inspection.id}
            </h2>
            {getStatusBadge(inspection.status)}
          </div>
          <div className="detail-actions">
            <button
              className="btn btn-success"
              onClick={handleGenerateReport}
              disabled={generatingReport}
            >
              {generatingReport ? 'Generating...' : '📊 Generate Report'}
            </button>
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
              {inspection.product?.name || 'N/A'}
              {inspection.product?.sku && <span style={{ color: 'var(--text-secondary)', marginLeft: '0.5rem' }}>
                ({inspection.product.sku})
              </span>}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Inspector</div>
            <div className="detail-value">{inspection.inspector_name}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">{getStatusBadge(inspection.status)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Created</div>
            <div className="detail-value">
              {new Date(inspection.created_at).toLocaleString()}
            </div>
          </div>
        </div>

        {inspection.notes && (
          <div className="detail-item" style={{ marginTop: '1.5rem' }}>
            <div className="detail-label">Notes</div>
            <div className="detail-value">{inspection.notes}</div>
          </div>
        )}

        {/* AI Image Analysis Section */}
        <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
          <h3 style={{ marginBottom: '1rem' }}>AI Image Analysis</h3>

          {!aiResult ? (
            <div>
              <div
                className={`ai-upload-zone`}
                onClick={() => fileInputRef.current?.click()}
                style={{ padding: '2rem' }}
              >
                <input
                  type="file"
                  ref={fileInputRef}
                  style={{ display: 'none' }}
                  accept="image/jpeg,image/png,image/gif,image/webp"
                  onChange={(e) => handleFileSelect(e.target.files[0])}
                />
                <div className="ai-upload-icon">📷</div>
                <p className="ai-upload-text">
                  <strong>Click to upload</strong> an image for AI defect analysis
                </p>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>
                  JPEG, PNG, GIF, or WebP (max 10MB)
                </p>
              </div>

              {preview && (
                <div style={{ marginTop: '1rem' }}>
                  <img src={preview} alt="Preview" style={{ maxWidth: '300px', borderRadius: '0.5rem' }} />
                  <div style={{ marginTop: '1rem', display: 'flex', gap: '0.75rem' }}>
                    <button
                      className="btn btn-primary"
                      onClick={handleAnalyze}
                      disabled={analyzing}
                    >
                      {analyzing ? (
                        <>
                          <span className="spinner" style={{ width: '16px', height: '16px', borderWidth: '2px' }}></span>
                          Analyzing...
                        </>
                      ) : (
                        '🔍 Analyze Image'
                      )}
                    </button>
                    <button
                      className="btn btn-outline"
                      onClick={() => { setSelectedFile(null); setPreview(null); }}
                    >
                      Clear
                    </button>
                  </div>
                </div>
              )}

              {aiError && <div className="error-message" style={{ marginTop: '1rem' }}>{aiError}</div>}
            </div>
          ) : (
            <div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
                <button
                  className="btn btn-outline"
                  onClick={() => { setAiResult(null); setSelectedFile(null); setPreview(null); }}
                >
                  Run New Analysis
                </button>
              </div>
              <AIResultDisplay result={aiResult} />
            </div>
          )}
        </div>

        {/* Related Defects */}
        {inspection.defects && inspection.defects.length > 0 && (
          <div style={{ marginTop: '2rem', paddingTop: '2rem', borderTop: '1px solid var(--border)' }}>
            <h3 style={{ marginBottom: '1rem' }}>Related Defects ({inspection.defects.length})</h3>
            {inspection.defects.map((defect) => (
              <div
                key={defect.id}
                className="ai-issue-card"
                style={{ cursor: 'pointer' }}
                onClick={() => navigate(`/defects/${defect.id}`)}
              >
                <div className="ai-issue-header">
                  <span className="ai-issue-type">{defect.defect_type}</span>
                  <span className={`badge severity-${defect.severity}`}>{defect.severity}</span>
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {defect.description}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Inspection"
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
            <label>Inspector Name</label>
            <input
              type="text"
              name="inspector_name"
              value={formData.inspector_name || ''}
              onChange={handleInputChange}
              required
            />
          </div>
          <div className="form-group">
            <label>Status</label>
            <select
              name="status"
              value={formData.status || 'pending'}
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
              value={formData.notes || ''}
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
        title="Delete Inspection"
      >
        <p>Are you sure you want to delete this inspection? This action cannot be undone.</p>
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

export default InspectionDetail;
