import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import Modal from '../common/Modal';

function ReportDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  useEffect(() => {
    fetchReport();
  }, [id]);

  const fetchReport = async () => {
    try {
      const response = await axios.get(`/api/reports/${id}`);
      setReport(response.data);
    } catch (err) {
      setError('Failed to fetch report');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    try {
      await axios.delete(`/api/reports/${id}`);
      navigate('/reports');
    } catch (err) {
      setError('Failed to delete report');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getQualityScoreColor = (score) => {
    if (score >= 80) return '#22c55e';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
  };

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'critical': return '#7f1d1d';
      case 'high': return '#ef4444';
      case 'medium': return '#f59e0b';
      case 'low': return '#22c55e';
      default: return '#64748b';
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

  if (error || !report) {
    return (
      <div className="main-content">
        <div className="error-message">{error || 'Report not found'}</div>
        <button className="btn btn-outline" onClick={() => navigate('/reports')}>
          Back to Reports
        </button>
      </div>
    );
  }

  const data = report.report_data || {};

  return (
    <div className="main-content">
      <div className="breadcrumb">
        <a href="/">Dashboard</a> / <a href="/reports">Reports</a> / Report #{report.id}
      </div>

      <div className="detail-container" id="report-content">
        <div className="detail-header">
          <div>
            <h2 className="detail-title">Inspection Report #{report.id}</h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
              Generated on {new Date(report.created_at).toLocaleString()}
            </p>
          </div>
          <div className="detail-actions">
            <button className="btn btn-primary" onClick={handlePrint}>
              🖨️ Print
            </button>
            <button className="btn btn-danger" onClick={() => setShowDeleteModal(true)}>
              Delete
            </button>
          </div>
        </div>

        {/* Quality Score Card */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '1rem',
          padding: '2rem',
          textAlign: 'center',
          marginBottom: '2rem'
        }}>
          <h3 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Quality Score</h3>
          <div style={{
            fontSize: '4rem',
            fontWeight: '700',
            color: getQualityScoreColor(data.quality_score || 0)
          }}>
            {data.quality_score || 0}%
          </div>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
            {data.quality_score >= 80 ? 'Excellent Quality' :
             data.quality_score >= 60 ? 'Acceptable Quality' : 'Needs Improvement'}
          </p>
        </div>

        {/* Product & Inspection Info */}
        <div className="detail-grid" style={{ marginBottom: '2rem' }}>
          <div className="detail-item">
            <div className="detail-label">Product</div>
            <div className="detail-value">{data.product?.name || 'N/A'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">SKU</div>
            <div className="detail-value">{data.product?.sku || 'N/A'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Category</div>
            <div className="detail-value">{data.product?.category || 'N/A'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Inspector</div>
            <div className="detail-value">{data.inspector || 'N/A'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Inspection Date</div>
            <div className="detail-value">
              {data.inspection_date ? new Date(data.inspection_date).toLocaleString() : 'N/A'}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Status</div>
            <div className="detail-value">
              <span className={`badge badge-${data.status === 'completed' ? 'success' :
                              data.status === 'failed' ? 'danger' : 'secondary'}`}>
                {data.status || 'N/A'}
              </span>
            </div>
          </div>
        </div>

        {/* Notes */}
        {data.notes && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Inspection Notes</h3>
            <div style={{
              background: '#f8fafc',
              padding: '1rem',
              borderRadius: '0.5rem',
              border: '1px solid var(--border)'
            }}>
              {data.notes}
            </div>
          </div>
        )}

        {/* Defects Summary */}
        <div style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1rem' }}>Defects Summary</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <div style={{
              flex: '1',
              minWidth: '150px',
              padding: '1.5rem',
              background: '#f8fafc',
              borderRadius: '0.75rem',
              textAlign: 'center'
            }}>
              <div style={{ fontSize: '2.5rem', fontWeight: '600', color: 'var(--text-primary)' }}>
                {data.defects_summary?.total || 0}
              </div>
              <div style={{ color: 'var(--text-secondary)' }}>Total Defects</div>
            </div>
            {[
              { label: 'Critical', key: 'critical', color: '#7f1d1d' },
              { label: 'High', key: 'high', color: '#ef4444' },
              { label: 'Medium', key: 'medium', color: '#f59e0b' },
              { label: 'Low', key: 'low', color: '#22c55e' }
            ].map(item => (
              <div key={item.key} style={{
                flex: '1',
                minWidth: '100px',
                padding: '1.5rem',
                background: '#f8fafc',
                borderRadius: '0.75rem',
                textAlign: 'center'
              }}>
                <div style={{ fontSize: '2rem', fontWeight: '600', color: item.color }}>
                  {data.defects_summary?.by_severity?.[item.key] || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Defects List */}
        {data.defects && data.defects.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>Defect Details</h3>
            {data.defects.map((defect, index) => (
              <div key={index} style={{
                border: '1px solid var(--border)',
                borderRadius: '0.75rem',
                padding: '1rem',
                marginBottom: '0.75rem',
                borderLeft: `4px solid ${getSeverityColor(defect.severity)}`
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.5rem' }}>
                  <span style={{ fontWeight: '600' }}>{defect.type}</span>
                  <span className="badge" style={{
                    backgroundColor: getSeverityColor(defect.severity),
                    color: 'white'
                  }}>
                    {defect.severity}
                  </span>
                </div>
                {defect.location && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '0.25rem' }}>
                    <strong>Location:</strong> {defect.location}
                  </p>
                )}
                {defect.description && (
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                    {defect.description}
                  </p>
                )}
              </div>
            ))}
          </div>
        )}

        {/* AI Analysis */}
        {data.ai_analysis && (
          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ marginBottom: '1rem' }}>AI Analysis Results</h3>
            <div style={{
              background: '#f8fafc',
              padding: '1.5rem',
              borderRadius: '0.75rem',
              border: '1px solid var(--border)'
            }}>
              {data.ai_analysis.summary && (
                <p style={{ marginBottom: '1rem' }}><strong>Summary:</strong> {data.ai_analysis.summary}</p>
              )}
              {data.ai_analysis.confidence && (
                <p><strong>Confidence:</strong> {data.ai_analysis.confidence}%</p>
              )}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{
          marginTop: '2rem',
          paddingTop: '1rem',
          borderTop: '1px solid var(--border)',
          color: 'var(--text-secondary)',
          fontSize: '0.75rem',
          textAlign: 'center'
        }}>
          Report generated by AI Visual QA Inspector • {new Date(data.generated_at || report.created_at).toLocaleString()}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Report"
      >
        <p>Are you sure you want to delete this report? This action cannot be undone.</p>
        <div className="modal-footer">
          <button className="btn btn-outline" onClick={() => setShowDeleteModal(false)}>
            Cancel
          </button>
          <button className="btn btn-danger" onClick={handleDelete}>
            Delete
          </button>
        </div>
      </Modal>

      {/* Print Styles */}
      <style>{`
        @media print {
          .header, .breadcrumb, .detail-actions, .modal-overlay {
            display: none !important;
          }
          .main-content {
            padding: 0;
          }
          .detail-container {
            box-shadow: none;
          }
        }
      `}</style>
    </div>
  );
}

export default ReportDetail;
