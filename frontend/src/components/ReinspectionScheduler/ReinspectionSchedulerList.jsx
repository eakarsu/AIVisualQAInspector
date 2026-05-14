import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function ReinspectionSchedulerList() {
  const [items, setItems] = useState([]);
  const [products, setProducts] = useState([]);
  const [inspections, setInspections] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const [showCreate, setShowCreate] = useState(false);
  const [showAuto, setShowAuto] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [createForm, setCreateForm] = useState({ inspection_id: '', product_id: '', reason: '', scheduled_at: '', priority: 'normal' });
  const [autoForm, setAutoForm] = useState({ inspection_id: '', product_id: '', confidence_score: '', reason: '' });

  useEffect(() => {
    fetchAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, statusFilter]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      if (statusFilter) params.append('status', statusFilter);
      const [listRes, prodRes, inspRes] = await Promise.all([
        axios.get(`/api/reinspection-scheduler?${params.toString()}`),
        axios.get('/api/products'),
        axios.get('/api/inspections')
      ]);
      setItems(listRes.data.data || []);
      if (listRes.data.pagination) setPagination(listRes.data.pagination);
      setProducts(prodRes.data);
      setInspections(inspRes.data);
    } catch (err) {
      setError('Failed to fetch schedules');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = { ...createForm };
      if (!payload.inspection_id) delete payload.inspection_id;
      if (!payload.product_id) delete payload.product_id;
      if (!payload.scheduled_at) delete payload.scheduled_at;
      await axios.post('/api/reinspection-scheduler', payload);
      setShowCreate(false);
      setCreateForm({ inspection_id: '', product_id: '', reason: '', scheduled_at: '', priority: 'normal' });
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create schedule');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAutoSchedule = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = {
        inspection_id: autoForm.inspection_id || undefined,
        product_id: autoForm.product_id || undefined,
        confidence_score: parseFloat(autoForm.confidence_score),
        reason: autoForm.reason || undefined
      };
      const res = await axios.post('/api/reinspection-scheduler/auto-schedule', payload);
      alert(res.data.message || 'Auto-schedule completed');
      setShowAuto(false);
      setAutoForm({ inspection_id: '', product_id: '', confidence_score: '', reason: '' });
      fetchAll();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Auto-schedule failed');
    } finally {
      setSubmitting(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await axios.put(`/api/reinspection-scheduler/${id}`, { status });
      fetchAll();
    } catch (err) {
      alert('Update failed: ' + (err.response?.data?.error || err.message));
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this schedule?')) return;
    try {
      await axios.delete(`/api/reinspection-scheduler/${id}`);
      fetchAll();
    } catch (err) {
      alert('Delete failed');
    }
  };

  const getPriorityBadge = (p) => {
    const map = { high: 'danger', normal: 'warning', low: 'secondary' };
    return <span className={`badge badge-${map[p] || 'secondary'}`}>{p}</span>;
  };
  const getStatusBadge = (s) => {
    const map = { pending: 'warning', completed: 'success', cancelled: 'secondary', in_progress: 'warning' };
    return <span className={`badge badge-${map[s] || 'secondary'}`}>{s}</span>;
  };

  const columns = [
    { header: '#', accessor: 'id' },
    { header: 'Reason', accessor: 'reason' },
    {
      header: 'Confidence',
      accessor: 'confidence_score',
      render: (r) => r.confidence_score !== null && r.confidence_score !== undefined
        ? <span className={`badge badge-${r.confidence_score < 0.5 ? 'danger' : r.confidence_score < 0.75 ? 'warning' : 'success'}`}>{(r.confidence_score * 100).toFixed(0)}%</span>
        : '-'
    },
    { header: 'Priority', accessor: 'priority', render: (r) => getPriorityBadge(r.priority) },
    { header: 'Status', accessor: 'status', render: (r) => getStatusBadge(r.status) },
    {
      header: 'Scheduled For',
      accessor: 'scheduled_at',
      render: (r) => r.scheduled_at ? new Date(r.scheduled_at).toLocaleString() : '-'
    },
    {
      header: 'Actions',
      accessor: 'actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {r.status === 'pending' && (
            <>
              <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); updateStatus(r.id, 'completed'); }}>✓</button>
              <button className="btn btn-sm btn-outline" onClick={(e) => { e.stopPropagation(); updateStatus(r.id, 'cancelled'); }}>✕</button>
            </>
          )}
          <button className="btn btn-sm btn-outline" style={{ color: '#ef4444' }} onClick={(e) => { e.stopPropagation(); handleDelete(r.id); }}>🗑</button>
        </div>
      )
    }
  ];

  if (loading) {
    return <div className="main-content"><div className="loading-spinner"><div className="spinner"></div></div></div>;
  }

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <div className="breadcrumb">
            <a href="/">Dashboard</a> / Reinspection Scheduler
          </div>
          <h2>Reinspection Scheduler</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Auto-schedule re-inspections for low-confidence AI verdicts
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setShowAuto(true)}>🤖 Auto-Schedule</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ Manual Schedule</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="card" style={{ padding: '1rem', marginBottom: '1rem' }}>
        <label style={{ marginRight: '0.5rem' }}>Filter Status:</label>
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}>
          <option value="">All</option>
          <option value="pending">Pending</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      <Table columns={columns} data={items} />

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ padding: '0.5rem 1rem' }}>Page {page} of {pagination.totalPages}</span>
          <button className="btn btn-outline" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="Manual Re-Inspection Schedule">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Inspection</label>
            <select value={createForm.inspection_id} onChange={(e) => setCreateForm({ ...createForm, inspection_id: e.target.value })}>
              <option value="">— Select inspection —</option>
              {inspections.map(i => <option key={i.id} value={i.id}>#{i.id} {i.product?.name || ''}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Product</label>
            <select value={createForm.product_id} onChange={(e) => setCreateForm({ ...createForm, product_id: e.target.value })}>
              <option value="">— Select product —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Reason</label>
            <textarea value={createForm.reason} onChange={(e) => setCreateForm({ ...createForm, reason: e.target.value })} rows={3} placeholder="Why does this need re-inspection?" />
          </div>
          <div className="form-group">
            <label>Scheduled For</label>
            <input type="datetime-local" value={createForm.scheduled_at} onChange={(e) => setCreateForm({ ...createForm, scheduled_at: e.target.value })} />
          </div>
          <div className="form-group">
            <label>Priority</label>
            <select value={createForm.priority} onChange={(e) => setCreateForm({ ...createForm, priority: e.target.value })}>
              <option value="high">High</option>
              <option value="normal">Normal</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Saving...' : 'Schedule'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showAuto} onClose={() => setShowAuto(false)} title="🤖 Auto-Schedule from Confidence Score">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleAutoSchedule}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Provide an AI confidence score (0–1). If below threshold, a re-inspection is auto-scheduled with priority based on the score.
          </p>
          <div className="form-group">
            <label>Confidence Score (0–1) *</label>
            <input type="number" min="0" max="1" step="0.01" value={autoForm.confidence_score} onChange={(e) => setAutoForm({ ...autoForm, confidence_score: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Inspection (optional)</label>
            <select value={autoForm.inspection_id} onChange={(e) => setAutoForm({ ...autoForm, inspection_id: e.target.value })}>
              <option value="">— None —</option>
              {inspections.map(i => <option key={i.id} value={i.id}>#{i.id}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Product (optional)</label>
            <select value={autoForm.product_id} onChange={(e) => setAutoForm({ ...autoForm, product_id: e.target.value })}>
              <option value="">— None —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Reason (optional)</label>
            <input type="text" value={autoForm.reason} onChange={(e) => setAutoForm({ ...autoForm, reason: e.target.value })} placeholder="Auto: low confidence" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowAuto(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Evaluating...' : 'Evaluate & Schedule'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default ReinspectionSchedulerList;
