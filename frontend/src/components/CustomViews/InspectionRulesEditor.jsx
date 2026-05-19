import React, { useEffect, useState, useCallback } from 'react';
import axios from 'axios';

const EMPTY = {
  productLine: '',
  ruleName: '',
  metric: '',
  operator: '<=',
  threshold: 0,
  severityOnFail: 'medium',
  active: true
};

export default function InspectionRulesEditor() {
  const [rules, setRules] = useState([]);
  const [productLines, setProductLines] = useState([]);
  const [filter, setFilter] = useState('');
  const [draft, setDraft] = useState({ ...EMPTY });
  const [editingId, setEditingId] = useState(null);
  const [err, setErr] = useState(null);
  const [busy, setBusy] = useState(false);

  const load = useCallback(async () => {
    setErr(null);
    try {
      const params = filter ? { productLine: filter } : {};
      const r = await axios.get('/api/custom-views/inspection-rules', { params });
      setRules(r.data.rules);
      setProductLines(r.data.productLines || []);
    } catch (e) {
      setErr(e.message);
    }
  }, [filter]);

  useEffect(() => {
    load();
  }, [load]);

  const submit = async () => {
    setBusy(true);
    setErr(null);
    try {
      if (editingId) {
        await axios.put(`/api/custom-views/inspection-rules/${editingId}`, draft);
      } else {
        await axios.post('/api/custom-views/inspection-rules', draft);
      }
      setDraft({ ...EMPTY });
      setEditingId(null);
      await load();
    } catch (e) {
      setErr(e.response?.data?.error || e.message);
    } finally {
      setBusy(false);
    }
  };

  const startEdit = (rule) => {
    setDraft({
      productLine: rule.productLine,
      ruleName: rule.ruleName,
      metric: rule.metric,
      operator: rule.operator,
      threshold: rule.threshold,
      severityOnFail: rule.severityOnFail,
      active: rule.active
    });
    setEditingId(rule.id);
  };

  const remove = async (id) => {
    if (!window.confirm('Delete this rule?')) return;
    await axios.delete(`/api/custom-views/inspection-rules/${id}`);
    await load();
  };

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>Inspection Rules Editor (per Product Line)</h3>

      <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
        <label style={{ fontSize: 13 }}>Filter:</label>
        <select value={filter} onChange={(e) => setFilter(e.target.value)} style={{ padding: '4px 8px' }}>
          <option value="">All product lines</option>
          {productLines.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
        <span style={{ color: '#6b7280', fontSize: 12 }}>{rules.length} rule(s)</span>
      </div>

      {err && <div style={{ color: '#ef4444', marginBottom: 8 }}>Error: {err}</div>}

      <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
        <thead>
          <tr style={{ background: '#f9fafb', textAlign: 'left' }}>
            <th style={{ padding: 8 }}>Product Line</th>
            <th style={{ padding: 8 }}>Rule</th>
            <th style={{ padding: 8 }}>Metric</th>
            <th style={{ padding: 8 }}>Op</th>
            <th style={{ padding: 8 }}>Threshold</th>
            <th style={{ padding: 8 }}>Severity</th>
            <th style={{ padding: 8 }}>Active</th>
            <th style={{ padding: 8 }}>Actions</th>
          </tr>
        </thead>
        <tbody>
          {rules.map((r) => (
            <tr key={r.id} style={{ borderTop: '1px solid #e5e7eb' }}>
              <td style={{ padding: 8 }}>{r.productLine}</td>
              <td style={{ padding: 8 }}>{r.ruleName}</td>
              <td style={{ padding: 8 }}><code>{r.metric}</code></td>
              <td style={{ padding: 8 }}>{r.operator}</td>
              <td style={{ padding: 8 }}>{r.threshold}</td>
              <td style={{ padding: 8 }}>{r.severityOnFail}</td>
              <td style={{ padding: 8 }}>{r.active ? 'yes' : 'no'}</td>
              <td style={{ padding: 8 }}>
                <button onClick={() => startEdit(r)} style={{ marginRight: 6 }}>Edit</button>
                <button onClick={() => remove(r.id)} style={{ color: '#ef4444' }}>Delete</button>
              </td>
            </tr>
          ))}
          {rules.length === 0 && (
            <tr><td colSpan={8} style={{ padding: 12, color: '#6b7280' }}>No rules.</td></tr>
          )}
        </tbody>
      </table>

      <h4 style={{ marginTop: 16, marginBottom: 8 }}>{editingId ? `Edit rule #${editingId}` : 'Add new rule'}</h4>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8 }}>
        <input placeholder="Product line" value={draft.productLine} onChange={(e) => setDraft({ ...draft, productLine: e.target.value })} />
        <input placeholder="Rule name" value={draft.ruleName} onChange={(e) => setDraft({ ...draft, ruleName: e.target.value })} />
        <input placeholder="Metric" value={draft.metric} onChange={(e) => setDraft({ ...draft, metric: e.target.value })} />
        <select value={draft.operator} onChange={(e) => setDraft({ ...draft, operator: e.target.value })}>
          <option>&lt;</option>
          <option>&lt;=</option>
          <option>==</option>
          <option>&gt;=</option>
          <option>&gt;</option>
        </select>
        <input placeholder="Threshold" type="number" value={draft.threshold} onChange={(e) => setDraft({ ...draft, threshold: e.target.value })} />
        <select value={draft.severityOnFail} onChange={(e) => setDraft({ ...draft, severityOnFail: e.target.value })}>
          <option value="low">low</option>
          <option value="medium">medium</option>
          <option value="high">high</option>
          <option value="critical">critical</option>
        </select>
        <label style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <input type="checkbox" checked={!!draft.active} onChange={(e) => setDraft({ ...draft, active: e.target.checked })} />
          active
        </label>
        <div style={{ display: 'flex', gap: 6 }}>
          <button onClick={submit} disabled={busy} style={{ background: '#2563eb', color: '#fff', border: 0, padding: '6px 12px', borderRadius: 4 }}>
            {editingId ? 'Save' : 'Create'}
          </button>
          {editingId && (
            <button onClick={() => { setDraft({ ...EMPTY }); setEditingId(null); }}>Cancel</button>
          )}
        </div>
      </div>
    </div>
  );
}
