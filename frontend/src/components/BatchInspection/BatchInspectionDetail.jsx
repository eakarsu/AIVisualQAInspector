import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import AIResultDisplay from '../common/AIResultDisplay';

function BatchInspectionDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [batch, setBatch] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchBatch();
    const interval = setInterval(() => {
      if (batch?.status === 'processing') fetchBatch();
    }, 5000);
    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, batch?.status]);

  const fetchBatch = async () => {
    try {
      const res = await axios.get(`/api/batch-inspection/${id}`);
      setBatch(res.data);
    } catch (err) {
      setError('Failed to fetch batch');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete this batch and all its results?')) return;
    try {
      await axios.delete(`/api/batch-inspection/${id}`);
      navigate('/batch-inspection');
    } catch (err) {
      alert('Failed to delete: ' + (err.response?.data?.error || err.message));
    }
  };

  if (loading) {
    return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  if (error || !batch) {
    return <div className="main-content"><div className="error-message">{error || 'Not found'}</div></div>;
  }

  const results = Array.isArray(batch.results) ? batch.results : [];
  const completedCount = results.filter(r => r.status === 'completed').length;
  const failedCount = results.filter(r => r.status === 'failed').length;

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <a href="/">Dashboard</a> / <a href="/batch-inspection">Batch Inspection</a> / #{batch.id}
          </div>
          <h2>{batch.name}</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Status: <strong style={{ textTransform: 'uppercase' }}>{batch.status}</strong> &middot;
            Created: {new Date(batch.created_at).toLocaleString()}
          </p>
        </div>
        <button className="btn btn-outline" onClick={handleDelete} style={{ color: '#ef4444' }}>
          Delete Batch
        </button>
      </div>

      <div className="stats-row">
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value">{batch.total_images}</div>
            <div className="stat-label">Total Images</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#10b981' }}>{completedCount}</div>
            <div className="stat-label">Completed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value" style={{ color: '#ef4444' }}>{failedCount}</div>
            <div className="stat-label">Failed</div>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-info">
            <div className="stat-value">{batch.product?.name || '-'}</div>
            <div className="stat-label">Product</div>
          </div>
        </div>
      </div>

      {batch.status === 'processing' && (
        <div style={{
          background: '#fef3c7',
          border: '1px solid #fcd34d',
          padding: '1rem',
          borderRadius: '0.5rem',
          marginBottom: '1.5rem'
        }}>
          ⏳ Batch is currently processing. This page will refresh automatically every 5s.
        </div>
      )}

      {batch.aggregate_report && (
        <AIResultDisplay result={batch.aggregate_report} title="Aggregate Quality Report" />
      )}

      <div style={{ marginTop: '2rem' }}>
        <h3 style={{ marginBottom: '1rem' }}>Per-Image Results ({results.length})</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
          {results.map((r, idx) => (
            <div key={idx} style={{
              background: 'white',
              border: '1px solid #e2e8f0',
              borderRadius: '0.75rem',
              padding: '1rem',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)'
            }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
                <strong style={{ fontSize: '0.875rem' }}>{r.filename}</strong>
                <span className={`badge badge-${r.status === 'completed' ? 'success' : 'danger'}`}>{r.status}</span>
              </div>
              {r.error ? (
                <p style={{ color: '#ef4444', fontSize: '0.85rem' }}>{r.error}</p>
              ) : r.analysis ? (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  <div><strong>Status:</strong> {r.analysis.status || 'analyzed'}</div>
                  {r.analysis.defects && (
                    <div><strong>Defects:</strong> {r.analysis.defects.length || 0}</div>
                  )}
                  {r.analysis.severity && (
                    <div><strong>Severity:</strong> {r.analysis.severity}</div>
                  )}
                  {r.analysis.quality_score !== undefined && (
                    <div><strong>Quality:</strong> {r.analysis.quality_score}/100</div>
                  )}
                </div>
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default BatchInspectionDetail;
