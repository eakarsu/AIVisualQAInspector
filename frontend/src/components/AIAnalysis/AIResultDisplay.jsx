import React from 'react';

function AIResultDisplay({ result }) {
  if (!result || !result.analysis) {
    return null;
  }

  const { analysis } = result;
  const isPassing = analysis.status === 'pass';

  const getConfidenceColor = (confidence) => {
    if (confidence >= 80) return '#22c55e';
    if (confidence >= 60) return '#f59e0b';
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

  const getMetricColor = (value) => {
    if (value >= 80) return '#22c55e';
    if (value >= 60) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="ai-results">
      {/* Status Card */}
      <div className={`ai-status-card ${isPassing ? 'ai-status-pass' : 'ai-status-fail'}`}>
        <div className="ai-status-icon">
          {isPassing ? '✓' : '✕'}
        </div>
        <div className="ai-status-text">
          <h3>{isPassing ? 'Quality Check Passed' : 'Defects Detected'}</h3>
          <p>{analysis.summary}</p>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="ai-confidence">
        <h4>Analysis Confidence</h4>
        <div className="confidence-bar-container">
          <div
            className="confidence-bar"
            style={{
              width: `${analysis.confidence}%`,
              backgroundColor: getConfidenceColor(analysis.confidence)
            }}
          />
        </div>
        <div className="confidence-value" style={{ color: getConfidenceColor(analysis.confidence) }}>
          {analysis.confidence}%
        </div>
      </div>

      {/* Quality Metrics */}
      {analysis.quality_metrics && (
        <div className="ai-metrics">
          {Object.entries(analysis.quality_metrics).map(([key, value]) => (
            <div key={key} className="ai-metric-card">
              <h5>{key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</h5>
              <div className="ai-metric-value" style={{ color: getMetricColor(value) }}>
                {value}%
              </div>
              <div
                style={{
                  height: '4px',
                  background: '#e2e8f0',
                  borderRadius: '2px',
                  marginTop: '0.5rem',
                  overflow: 'hidden'
                }}
              >
                <div
                  style={{
                    height: '100%',
                    width: `${value}%`,
                    backgroundColor: getMetricColor(value),
                    borderRadius: '2px'
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detected Issues */}
      {analysis.detected_issues && analysis.detected_issues.length > 0 && (
        <div className="ai-issues">
          <h4>Detected Issues ({analysis.detected_issues.length})</h4>
          {analysis.detected_issues.map((issue, index) => (
            <div key={index} className="ai-issue-card">
              <div className="ai-issue-header">
                <span className="ai-issue-type">
                  <span style={{ marginRight: '0.5rem' }}>
                    {issue.severity === 'critical' ? '🔴' :
                     issue.severity === 'high' ? '🟠' :
                     issue.severity === 'medium' ? '🟡' : '🟢'}
                  </span>
                  {issue.type}
                </span>
                <span
                  className="badge"
                  style={{
                    backgroundColor: getSeverityColor(issue.severity),
                    color: 'white'
                  }}
                >
                  {issue.severity}
                </span>
              </div>
              {issue.location && (
                <p className="ai-issue-location">
                  <strong>Location:</strong> {issue.location}
                </p>
              )}
              {issue.description && (
                <p style={{ marginTop: '0.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
                  {issue.description}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* No Issues Found */}
      {(!analysis.detected_issues || analysis.detected_issues.length === 0) && (
        <div className="ai-issues">
          <h4>Detected Issues</h4>
          <div style={{
            textAlign: 'center',
            padding: '2rem',
            color: 'var(--text-secondary)'
          }}>
            <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
            <p>No defects or issues detected</p>
          </div>
        </div>
      )}

      {/* Recommendations */}
      {analysis.recommendations && analysis.recommendations.length > 0 && (
        <div className="ai-recommendations">
          <h4>Recommendations</h4>
          {analysis.recommendations.map((rec, index) => (
            <div key={index} className="ai-recommendation-item">
              <span className="ai-recommendation-icon">💡</span>
              <span>{rec}</span>
            </div>
          ))}
        </div>
      )}

      {/* Model Info */}
      <div style={{
        marginTop: '1.5rem',
        padding: '1rem',
        background: '#f8fafc',
        borderRadius: '0.5rem',
        fontSize: '0.75rem',
        color: 'var(--text-secondary)'
      }}>
        <strong>AI Model:</strong> {result.model || 'Claude Haiku 4.5'}
      </div>
    </div>
  );
}

export default AIResultDisplay;
