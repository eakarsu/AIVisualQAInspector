import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Dashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    products: 0,
    inspections: 0,
    defects: 0,
    reports: 0,
    classifications: 0,
    severityScores: 0,
    rootCauses: 0,
    trends: 0,
    qualityInspections: 0,
    packagingOptimizations: 0,
    aiReports: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await axios.get('/api/stats');
        setStats(response.data);
      } catch (err) {
        console.error('Error fetching stats:', err);
        try {
          const [productsRes, inspectionsRes, defectsRes, reportsRes] = await Promise.all([
            axios.get('/api/products'),
            axios.get('/api/inspections'),
            axios.get('/api/defects'),
            axios.get('/api/reports')
          ]);
          setStats(prev => ({
            ...prev,
            products: productsRes.data.length,
            inspections: inspectionsRes.data.length,
            defects: defectsRes.data.length,
            reports: reportsRes.data.length
          }));
        } catch (e) {
          console.error('Fallback error:', e);
        }
      }
    };
    fetchStats();
  }, []);

  const summaryStats = [
    { label: 'Products', value: stats.products, color: '#6366f1', bg: '#eef2ff', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"/>
      </svg>
    )},
    { label: 'Inspections', value: stats.inspections, color: '#10b981', bg: '#d1fae5', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    )},
    { label: 'Defects', value: stats.defects, color: '#f59e0b', bg: '#fef3c7', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    )},
    { label: 'Reports', value: stats.reports, color: '#3b82f6', bg: '#dbeafe', icon: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
        <polyline points="14 2 14 8 20 8"/>
      </svg>
    )}
  ];

  const coreFeatures = [
    {
      title: 'Products',
      description: 'Manage product catalog and specifications',
      icon: '📦',
      color: '#6366f1',
      path: '/products',
      stat: stats.products
    },
    {
      title: 'Inspections',
      description: 'View and manage QA inspection records',
      icon: '🔍',
      color: '#10b981',
      path: '/inspections',
      stat: stats.inspections
    },
    {
      title: 'Defects',
      description: 'Track and manage reported defects',
      icon: '⚠️',
      color: '#f59e0b',
      path: '/defects',
      stat: stats.defects
    },
    {
      title: 'Reports',
      description: 'Generate and view inspection reports',
      icon: '📊',
      color: '#3b82f6',
      path: '/reports',
      stat: stats.reports
    }
  ];

  const aiFeatures = [
    {
      title: 'AI Defect Classifier',
      description: 'AI-powered defect classification and categorization',
      icon: '🤖',
      color: '#8b5cf6',
      path: '/defect-classifier',
      stat: stats.classifications
    },
    {
      title: 'AI Severity Scorer',
      description: 'Intelligent severity assessment and scoring',
      icon: '📈',
      color: '#ef4444',
      path: '/severity-scorer',
      stat: stats.severityScores
    },
    {
      title: 'AI Root Cause Analyzer',
      description: '5 Whys and Fishbone analysis powered by AI',
      icon: '🔬',
      color: '#ec4899',
      path: '/root-cause',
      stat: stats.rootCauses
    },
    {
      title: 'AI Trend Tracker',
      description: 'Quality trend analysis and predictions',
      icon: '📉',
      color: '#14b8a6',
      path: '/trend-tracker',
      stat: stats.trends
    },
    {
      title: 'AI Quality Inspector',
      description: 'Comprehensive AI quality inspection',
      icon: '✅',
      color: '#10b981',
      path: '/quality-inspector',
      stat: stats.qualityInspections
    },
    {
      title: 'AI Packaging Optimizer',
      description: 'Smart packaging optimization suggestions',
      icon: '📦',
      color: '#f97316',
      path: '/packaging-optimizer',
      stat: stats.packagingOptimizations
    },
    {
      title: 'AI Report Generator',
      description: 'AI-powered comprehensive report generation',
      icon: '📄',
      color: '#6366f1',
      path: '/report-generator',
      stat: stats.aiReports
    },
    {
      title: 'AI Visual Analysis',
      description: 'Upload images for AI-powered defect detection',
      icon: '📷',
      color: '#6366f1',
      path: '/ai-analysis',
      stat: null
    }
  ];

  const opsFeatures = [
    {
      title: 'Batch Inspection',
      description: 'Upload up to 20 images for parallel async AI analysis',
      icon: '🗂️',
      color: '#8b5cf6',
      path: '/batch-inspection',
      stat: null
    },
    {
      title: 'Defect Trend Analytics',
      description: 'Time-series defect tracking + AI predictive analysis',
      icon: '📊',
      color: '#0ea5e9',
      path: '/defect-trend-analytics',
      stat: null
    },
    {
      title: 'Reinspection Scheduler',
      description: 'Auto-schedule re-inspections from low-confidence verdicts',
      icon: '⏱️',
      color: '#14b8a6',
      path: '/reinspection-scheduler',
      stat: null
    },
    {
      title: 'MES Alerts',
      description: 'Manufacturing Execution System line-stop / quality-hold alerts',
      icon: '🚨',
      color: '#ef4444',
      path: '/mes-alerts',
      stat: null
    }
  ];

  return (
    <div className="main-content">
      <div className="page-header">
        <div>
          <h2>Dashboard</h2>
          <p className="page-header-sub">
            Manufacturing Quality Suite Overview
          </p>
        </div>
      </div>

      {/* Summary Stats */}
      <div className="stats-row">
        {summaryStats.map((item, i) => (
          <div key={i} className="stat-card">
            <div className="stat-icon" style={{ backgroundColor: item.bg, color: item.color }}>
              {item.icon}
            </div>
            <div className="stat-info">
              <div className="stat-value">{item.value}</div>
              <div className="stat-label">{item.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Core Features */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="section-header">
          <span className="section-title">Core Modules</span>
          <div className="section-divider" />
        </div>
        <div className="dashboard-grid">
          {coreFeatures.map((feature, index) => (
            <div
              key={index}
              className="dashboard-card"
              style={{ '--card-accent': feature.color }}
              onClick={() => navigate(feature.path)}
            >
              <div
                className="dashboard-card-icon"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {feature.stat !== null && (
                <div className="dashboard-card-stat" style={{ color: feature.color }}>
                  {feature.stat} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' }}>items</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* AI Features */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div className="section-header">
          <span className="section-title">AI-Powered Features</span>
          <span className="section-badge">Powered by Claude AI</span>
          <div className="section-divider" />
        </div>
        <div className="dashboard-grid">
          {aiFeatures.map((feature, index) => (
            <div
              key={index}
              className="dashboard-card"
              style={{ '--card-accent': feature.color }}
              onClick={() => navigate(feature.path)}
            >
              <span className="dashboard-card-badge">AI</span>
              <div
                className="dashboard-card-icon"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
              {feature.stat !== null && (
                <div className="dashboard-card-stat" style={{ color: feature.color }}>
                  {feature.stat} <span style={{ fontSize: '0.8125rem', fontWeight: 400, color: 'var(--text-secondary)' }}>items</span>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Operations Features */}
      <div>
        <div className="section-header">
          <span className="section-title">Operations & Workflow</span>
          <div className="section-divider" />
        </div>
        <div className="dashboard-grid">
          {opsFeatures.map((feature, index) => (
            <div
              key={index}
              className="dashboard-card"
              style={{ '--card-accent': feature.color }}
              onClick={() => navigate(feature.path)}
            >
              <div
                className="dashboard-card-icon"
                style={{ backgroundColor: `${feature.color}15` }}
              >
                {feature.icon}
              </div>
              <h3>{feature.title}</h3>
              <p>{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
