import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Table from '../common/Table';

function ReportList() {
  const navigate = useNavigate();
  const [reports, setReports] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [reportsRes, statsRes] = await Promise.all([
        axios.get('/api/reports'),
        axios.get('/api/reports/stats/summary')
      ]);
      setReports(reportsRes.data);
      setStats(statsRes.data);
    } catch (err) {
      setError('Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const columns = [
    {
      header: 'Report ID',
      accessor: 'id',
      render: (row) => `#${row.id}`
    },
    {
      header: 'Inspection',
      accessor: 'inspection',
      render: (row) => `#${row.inspection?.id} - ${row.inspection?.product?.name || 'N/A'}`
    },
    {
      header: 'Quality Score',
      accessor: 'report_data',
      render: (row) => {
        const score = row.report_data?.quality_score || 0;
        const color = score >= 80 ? '#22c55e' : score >= 60 ? '#f59e0b' : '#ef4444';
        return <span style={{ color, fontWeight: 600 }}>{score}%</span>;
      }
    },
    {
      header: 'Defects',
      accessor: 'report_data',
      render: (row) => row.report_data?.defects_summary?.total || 0
    },
    {
      header: 'Generated',
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
            <a href="/">Dashboard</a> / Reports
          </div>
          <h2>Inspection Reports</h2>
        </div>
      </div>

      {error && <div className="error-message">{error}</div>}

      {/* Statistics Cards */}
      {stats && (
        <div className="dashboard-grid" style={{ marginBottom: '2rem' }}>
          <div className="dashboard-card" style={{ cursor: 'default' }}>
            <div className="dashboard-card-icon" style={{ backgroundColor: '#dbeafe' }}>
              📊
            </div>
            <h3>Pass Rate</h3>
            <p>Overall inspection success</p>
            <div className="dashboard-card-stat" style={{
              color: stats.pass_rate >= 70 ? '#22c55e' : stats.pass_rate >= 50 ? '#f59e0b' : '#ef4444'
            }}>
              {stats.pass_rate}%
            </div>
          </div>
          <div className="dashboard-card" style={{ cursor: 'default' }}>
            <div className="dashboard-card-icon" style={{ backgroundColor: '#fef3c7' }}>
              ⚠️
            </div>
            <h3>Total Defects</h3>
            <p>Across all inspections</p>
            <div className="dashboard-card-stat">{stats.total_defects}</div>
          </div>
          <div className="dashboard-card" style={{ cursor: 'default' }}>
            <div className="dashboard-card-icon" style={{ backgroundColor: '#fee2e2' }}>
              🔴
            </div>
            <h3>Critical Issues</h3>
            <p>Requires immediate attention</p>
            <div className="dashboard-card-stat" style={{ color: '#ef4444' }}>
              {stats.defects_by_severity?.critical || 0}
            </div>
          </div>
          <div className="dashboard-card" style={{ cursor: 'default' }}>
            <div className="dashboard-card-icon" style={{ backgroundColor: '#dcfce7' }}>
              ✅
            </div>
            <h3>Completed</h3>
            <p>Inspections finished</p>
            <div className="dashboard-card-stat" style={{ color: '#22c55e' }}>
              {stats.inspections_by_status?.completed || 0}
            </div>
          </div>
        </div>
      )}

      {/* Defects by Severity Chart */}
      {stats && (
        <div className="detail-container" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Defects by Severity</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Critical', key: 'critical', color: '#7f1d1d' },
              { label: 'High', key: 'high', color: '#ef4444' },
              { label: 'Medium', key: 'medium', color: '#f59e0b' },
              { label: 'Low', key: 'low', color: '#22c55e' }
            ].map(item => (
              <div key={item.key} style={{
                flex: '1',
                minWidth: '120px',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  color: item.color,
                  marginBottom: '0.5rem'
                }}>
                  {stats.defects_by_severity?.[item.key] || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Inspection Status Chart */}
      {stats && (
        <div className="detail-container" style={{ marginBottom: '2rem' }}>
          <h3 style={{ marginBottom: '1.5rem' }}>Inspection Status Overview</h3>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {[
              { label: 'Pending', key: 'pending', color: '#64748b' },
              { label: 'In Progress', key: 'in_progress', color: '#3b82f6' },
              { label: 'Completed', key: 'completed', color: '#22c55e' },
              { label: 'Failed', key: 'failed', color: '#ef4444' }
            ].map(item => (
              <div key={item.key} style={{
                flex: '1',
                minWidth: '120px',
                padding: '1rem',
                background: '#f8fafc',
                borderRadius: '0.5rem',
                textAlign: 'center'
              }}>
                <div style={{
                  fontSize: '2rem',
                  fontWeight: '600',
                  color: item.color,
                  marginBottom: '0.5rem'
                }}>
                  {stats.inspections_by_status?.[item.key] || 0}
                </div>
                <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {item.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Reports Table */}
      <h3 style={{ marginBottom: '1rem' }}>Generated Reports ({reports.length})</h3>
      <Table
        columns={columns}
        data={reports}
        onRowClick={(row) => navigate(`/reports/${row.id}`)}
      />
    </div>
  );
}

export default ReportList;
