import React, { useState, useEffect } from 'react';
import axios from 'axios';
import Table from '../common/Table';
import Modal from '../common/Modal';

function MESAlertsList() {
  const [items, setItems] = useState([]);
  const [defects, setDefects] = useState([]);
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState({ total: 0, unacknowledged: 0, critical: 0, high: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filters, setFilters] = useState({ severity: '', acknowledged: '', line_id: '' });
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ totalPages: 1 });

  const [showCreate, setShowCreate] = useState(false);
  const [showFromDefect, setShowFromDefect] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');
  const [createForm, setCreateForm] = useState({ defect_id: '', product_id: '', alert_type: '', severity: 'medium', message: '', line_id: '' });
  const [fromDefectForm, setFromDefectForm] = useState({ defect_id: '', line_id: '' });

  useEffect(() => {
    fetchAll();
    fetchStats();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, filters]);

  const fetchAll = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams({ page, limit: 20 });
      Object.entries(filters).forEach(([k, v]) => { if (v) params.append(k, v); });
      const [listRes, defRes, prodRes] = await Promise.all([
        axios.get(`/api/mes-alerts?${params.toString()}`),
        axios.get('/api/defects'),
        axios.get('/api/products')
      ]);
      setItems(listRes.data.data || []);
      if (listRes.data.pagination) setPagination(listRes.data.pagination);
      setDefects(defRes.data);
      setProducts(prodRes.data);
    } catch (err) {
      setError('Failed to fetch alerts');
    } finally {
      setLoading(false);
    }
  };

  const fetchStats = async () => {
    try {
      const res = await axios.get('/api/mes-alerts/stats/summary');
      setStats(res.data);
    } catch {}
  };

  const acknowledge = async (id) => {
    try {
      await axios.put(`/api/mes-alerts/${id}/acknowledge`);
      fetchAll();
      fetchStats();
    } catch (err) {
      alert('Acknowledge failed');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Delete this alert?')) return;
    try {
      await axios.delete(`/api/mes-alerts/${id}`);
      fetchAll();
      fetchStats();
    } catch {
      alert('Delete failed');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const payload = { ...createForm };
      if (!payload.defect_id) delete payload.defect_id;
      if (!payload.product_id) delete payload.product_id;
      if (!payload.line_id) delete payload.line_id;
      await axios.post('/api/mes-alerts', payload);
      setShowCreate(false);
      setCreateForm({ defect_id: '', product_id: '', alert_type: '', severity: 'medium', message: '', line_id: '' });
      fetchAll();
      fetchStats();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed to create alert');
    } finally {
      setSubmitting(false);
    }
  };

  const handleFromDefect = async (e) => {
    e.preventDefault();
    setFormError('');
    setSubmitting(true);
    try {
      const res = await axios.post('/api/mes-alerts/from-defect', {
        defect_id: parseInt(fromDefectForm.defect_id),
        line_id: fromDefectForm.line_id || undefined
      });
      alert(res.data.message || 'Alert triggered');
      setShowFromDefect(false);
      setFromDefectForm({ defect_id: '', line_id: '' });
      fetchAll();
      fetchStats();
    } catch (err) {
      setFormError(err.response?.data?.error || 'Failed');
    } finally {
      setSubmitting(false);
    }
  };

  const sevBadge = (s) => {
    const map = { critical: 'danger', high: 'warning', medium: 'warning', low: 'secondary' };
    return <span className={`badge badge-${map[s] || 'secondary'}`}>{s?.toUpperCase()}</span>;
  };

  const columns = [
    { header: '#', accessor: 'id' },
    { header: 'Type', accessor: 'alert_type', render: (r) => <code style={{ fontSize: '0.75rem' }}>{r.alert_type}</code> },
    { header: 'Severity', accessor: 'severity', render: (r) => sevBadge(r.severity) },
    { header: 'Message', accessor: 'message', render: (r) => <div style={{ maxWidth: '400px', whiteSpace: 'normal' }}>{r.message}</div> },
    { header: 'Line', accessor: 'line_id' },
    { header: 'ACK', accessor: 'acknowledged', render: (r) => r.acknowledged ? <span className="badge badge-success">✓</span> : <span className="badge badge-warning">Pending</span> },
    { header: 'Created', accessor: 'created_at', render: (r) => new Date(r.created_at).toLocaleString() },
    {
      header: 'Actions', accessor: 'actions',
      render: (r) => (
        <div style={{ display: 'flex', gap: '0.25rem' }}>
          {!r.acknowledged && (
            <button className="btn btn-sm btn-success" onClick={(e) => { e.stopPropagation(); acknowledge(r.id); }}>ACK</button>
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
            <a href="/">Dashboard</a> / MES Alerts
          </div>
          <h2>MES Alerts</h2>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
            Manufacturing Execution System line-stop / quality-hold alerts
          </p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button className="btn btn-outline" onClick={() => setShowFromDefect(true)}>⚡ Trigger from Defect</button>
          <button className="btn btn-primary" onClick={() => setShowCreate(true)}>+ New Alert</button>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      <div className="stats-row">
        <div className="stat-card"><div className="stat-info"><div className="stat-value">{stats.total}</div><div className="stat-label">Total</div></div></div>
        <div className="stat-card"><div className="stat-info"><div className="stat-value" style={{ color: '#f59e0b' }}>{stats.unacknowledged}</div><div className="stat-label">Unacknowledged</div></div></div>
        <div className="stat-card"><div className="stat-info"><div className="stat-value" style={{ color: '#dc2626' }}>{stats.critical}</div><div className="stat-label">Critical Open</div></div></div>
        <div className="stat-card"><div className="stat-info"><div className="stat-value" style={{ color: '#ef4444' }}>{stats.high}</div><div className="stat-label">High Open</div></div></div>
      </div>

      <div className="card" style={{ padding: '1rem', marginBottom: '1rem', display: 'flex', gap: '1rem', alignItems: 'flex-end', flexWrap: 'wrap' }}>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Severity</label>
          <select value={filters.severity} onChange={(e) => { setFilters({ ...filters, severity: e.target.value }); setPage(1); }}>
            <option value="">All</option>
            <option value="critical">Critical</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Acknowledged</label>
          <select value={filters.acknowledged} onChange={(e) => { setFilters({ ...filters, acknowledged: e.target.value }); setPage(1); }}>
            <option value="">All</option>
            <option value="false">No</option>
            <option value="true">Yes</option>
          </select>
        </div>
        <div className="form-group" style={{ marginBottom: 0 }}>
          <label>Line ID</label>
          <input type="text" value={filters.line_id} onChange={(e) => { setFilters({ ...filters, line_id: e.target.value }); setPage(1); }} placeholder="e.g., LINE-A" />
        </div>
      </div>

      <Table columns={columns} data={items} />

      {pagination.totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '0.5rem', marginTop: '1rem' }}>
          <button className="btn btn-outline" disabled={page <= 1} onClick={() => setPage(p => p - 1)}>← Prev</button>
          <span style={{ padding: '0.5rem 1rem' }}>Page {page} of {pagination.totalPages}</span>
          <button className="btn btn-outline" disabled={page >= pagination.totalPages} onClick={() => setPage(p => p + 1)}>Next →</button>
        </div>
      )}

      <Modal isOpen={showCreate} onClose={() => setShowCreate(false)} title="New MES Alert">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleCreate}>
          <div className="form-group">
            <label>Alert Type *</label>
            <select value={createForm.alert_type} onChange={(e) => setCreateForm({ ...createForm, alert_type: e.target.value })} required>
              <option value="">Select type</option>
              <option value="LINE_STOP">LINE_STOP</option>
              <option value="QUALITY_HOLD">QUALITY_HOLD</option>
              <option value="QUALITY_WARNING">QUALITY_WARNING</option>
              <option value="MATERIAL_REJECT">MATERIAL_REJECT</option>
              <option value="MAINTENANCE">MAINTENANCE</option>
            </select>
          </div>
          <div className="form-group">
            <label>Severity *</label>
            <select value={createForm.severity} onChange={(e) => setCreateForm({ ...createForm, severity: e.target.value })}>
              <option value="critical">Critical</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          <div className="form-group">
            <label>Message *</label>
            <textarea rows={3} value={createForm.message} onChange={(e) => setCreateForm({ ...createForm, message: e.target.value })} required />
          </div>
          <div className="form-group">
            <label>Line ID</label>
            <input type="text" value={createForm.line_id} onChange={(e) => setCreateForm({ ...createForm, line_id: e.target.value })} placeholder="e.g., LINE-A-01" />
          </div>
          <div className="form-group">
            <label>Defect</label>
            <select value={createForm.defect_id} onChange={(e) => setCreateForm({ ...createForm, defect_id: e.target.value })}>
              <option value="">— None —</option>
              {defects.map(d => <option key={d.id} value={d.id}>#{d.id} {d.defect_type}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Product</label>
            <select value={createForm.product_id} onChange={(e) => setCreateForm({ ...createForm, product_id: e.target.value })}>
              <option value="">— None —</option>
              {products.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
            </select>
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowCreate(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Creating...' : 'Create Alert'}</button>
          </div>
        </form>
      </Modal>

      <Modal isOpen={showFromDefect} onClose={() => setShowFromDefect(false)} title="⚡ Trigger Alert from Defect">
        {formError && <div className="error-message">{formError}</div>}
        <form onSubmit={handleFromDefect}>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
            Auto-generates a LINE_STOP / QUALITY_HOLD / QUALITY_WARNING alert based on defect severity.
          </p>
          <div className="form-group">
            <label>Defect *</label>
            <select value={fromDefectForm.defect_id} onChange={(e) => setFromDefectForm({ ...fromDefectForm, defect_id: e.target.value })} required>
              <option value="">Select defect</option>
              {defects.map(d => <option key={d.id} value={d.id}>#{d.id} {d.defect_type} ({d.severity})</option>)}
            </select>
          </div>
          <div className="form-group">
            <label>Line ID</label>
            <input type="text" value={fromDefectForm.line_id} onChange={(e) => setFromDefectForm({ ...fromDefectForm, line_id: e.target.value })} placeholder="e.g., LINE-A-01" />
          </div>
          <div className="modal-footer">
            <button type="button" className="btn btn-outline" onClick={() => setShowFromDefect(false)}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>{submitting ? 'Triggering...' : 'Trigger Alert'}</button>
          </div>
        </form>
      </Modal>
    </div>
  );
}

export default MESAlertsList;
