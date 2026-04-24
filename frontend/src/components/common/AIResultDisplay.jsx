import React from 'react';

function AIResultDisplay({ result, title = 'AI Analysis Results' }) {
  if (!result) return null;

  const renderValue = (value, depth = 0) => {
    if (value === null || value === undefined) {
      return <span style={{ color: '#94a3b8' }}>N/A</span>;
    }

    if (typeof value === 'boolean') {
      return (
        <span className={`badge ${value ? 'badge-success' : 'badge-danger'}`}>
          {value ? 'Yes' : 'No'}
        </span>
      );
    }

    if (typeof value === 'number') {
      // Check if it's a score/percentage
      if (value >= 0 && value <= 100) {
        const color = value >= 80 ? '#22c55e' : value >= 60 ? '#f59e0b' : '#ef4444';
        return (
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '60px',
              height: '6px',
              background: '#e2e8f0',
              borderRadius: '3px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${value}%`,
                height: '100%',
                background: color,
                borderRadius: '3px'
              }} />
            </div>
            <span style={{ color, fontWeight: '600' }}>{value}%</span>
          </div>
        );
      }
      return <span style={{ fontWeight: '600', color: '#3b82f6' }}>{value}</span>;
    }

    if (typeof value === 'string') {
      // Check for severity/status
      const lowerValue = value.toLowerCase();
      if (['critical', 'high', 'medium', 'low'].includes(lowerValue)) {
        return <span className={`badge severity-${lowerValue}`}>{value}</span>;
      }
      if (['pass', 'passed', 'success'].includes(lowerValue)) {
        return <span className="badge badge-success">{value}</span>;
      }
      if (['fail', 'failed', 'error'].includes(lowerValue)) {
        return <span className="badge badge-danger">{value}</span>;
      }
      if (['pending', 'in_progress', 'needs_review'].includes(lowerValue)) {
        return <span className="badge badge-warning">{value}</span>;
      }
      return <span>{value}</span>;
    }

    if (Array.isArray(value)) {
      if (value.length === 0) {
        return <span style={{ color: '#94a3b8' }}>None</span>;
      }
      return (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          {value.map((item, idx) => (
            <div key={idx} style={{
              background: depth % 2 === 0 ? '#f8fafc' : '#fff',
              padding: '0.75rem',
              borderRadius: '0.5rem',
              border: '1px solid #e2e8f0'
            }}>
              {typeof item === 'object' ? renderObject(item, depth + 1) : renderValue(item, depth + 1)}
            </div>
          ))}
        </div>
      );
    }

    if (typeof value === 'object') {
      return renderObject(value, depth + 1);
    }

    return <span>{String(value)}</span>;
  };

  const renderObject = (obj, depth = 0) => {
    if (!obj || Object.keys(obj).length === 0) {
      return <span style={{ color: '#94a3b8' }}>No data</span>;
    }

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {Object.entries(obj).map(([key, value]) => (
          <div key={key}>
            <div style={{
              fontSize: '0.75rem',
              fontWeight: '600',
              color: '#64748b',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              marginBottom: '0.25rem'
            }}>
              {key.replace(/_/g, ' ')}
            </div>
            <div>{renderValue(value, depth)}</div>
          </div>
        ))}
      </div>
    );
  };

  const renderSection = (key, value) => {
    const formattedKey = key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());

    return (
      <div key={key} className="ai-result-section" style={{
        background: 'white',
        borderRadius: '0.75rem',
        padding: '1.25rem',
        boxShadow: '0 1px 3px rgba(0, 0, 0, 0.1)',
        marginBottom: '1rem'
      }}>
        <h4 style={{
          fontSize: '1rem',
          fontWeight: '600',
          color: '#1e293b',
          marginBottom: '1rem',
          paddingBottom: '0.75rem',
          borderBottom: '2px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          gap: '0.5rem'
        }}>
          {getSectionIcon(key)}
          {formattedKey}
        </h4>
        {renderValue(value)}
      </div>
    );
  };

  const getSectionIcon = (key) => {
    const icons = {
      classification: '🏷️',
      severity: '⚠️',
      root_cause: '🔍',
      trend: '📈',
      prediction: '🔮',
      recommendation: '💡',
      action: '✅',
      risk: '🚨',
      impact: '💥',
      metric: '📊',
      summary: '📝',
      finding: '🔎',
      cost: '💰',
      environmental: '🌱',
      quality: '✨',
      packaging: '📦'
    };

    for (const [keyword, icon] of Object.entries(icons)) {
      if (key.toLowerCase().includes(keyword)) {
        return icon;
      }
    }
    return '📋';
  };

  // Get summary if exists
  const summary = result.summary || result.executive_summary?.overview;

  return (
    <div className="ai-result-display" style={{ marginTop: '1.5rem' }}>
      <div style={{
        background: 'linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%)',
        color: 'white',
        padding: '1rem 1.5rem',
        borderRadius: '0.75rem 0.75rem 0 0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <span style={{ fontSize: '1.5rem' }}>🤖</span>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: '600' }}>{title}</h3>
            <p style={{ margin: 0, fontSize: '0.75rem', opacity: 0.9 }}>Powered by Claude AI</p>
          </div>
        </div>
        <span style={{
          background: 'rgba(255,255,255,0.2)',
          padding: '0.25rem 0.75rem',
          borderRadius: '9999px',
          fontSize: '0.75rem'
        }}>
          Analysis Complete
        </span>
      </div>

      <div style={{
        background: '#f8fafc',
        padding: '1.5rem',
        borderRadius: '0 0 0.75rem 0.75rem',
        border: '1px solid #e2e8f0',
        borderTop: 'none'
      }}>
        {/* Summary Card */}
        {summary && (
          <div style={{
            background: 'linear-gradient(135deg, #dbeafe 0%, #e0e7ff 100%)',
            padding: '1rem 1.25rem',
            borderRadius: '0.75rem',
            marginBottom: '1.5rem',
            border: '1px solid #bfdbfe'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: '0.75rem'
            }}>
              <span style={{ fontSize: '1.25rem' }}>📝</span>
              <div>
                <h4 style={{ margin: '0 0 0.5rem 0', fontSize: '0.875rem', fontWeight: '600', color: '#1e40af' }}>
                  Summary
                </h4>
                <p style={{ margin: 0, color: '#1e3a5f', lineHeight: '1.6' }}>
                  {summary}
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Main Content */}
        <div>
          {Object.entries(result)
            .filter(([key]) => key !== 'summary' && key !== 'executive_summary')
            .map(([key, value]) => renderSection(key, value))}
        </div>
      </div>
    </div>
  );
}

export default AIResultDisplay;
