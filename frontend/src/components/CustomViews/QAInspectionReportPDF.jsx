import React, { useState } from 'react';

export default function QAInspectionReportPDF() {
  const [status, setStatus] = useState('');
  const url = '/api/custom-views/qa-inspection-report-pdf';

  const download = async () => {
    setStatus('Downloading...');
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error('HTTP ' + res.status);
      const blob = await res.blob();
      const a = document.createElement('a');
      const dl = URL.createObjectURL(blob);
      a.href = dl;
      a.download = 'qa-inspection-report.pdf';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(dl);
      setStatus('Downloaded.');
    } catch (e) {
      setStatus('Failed: ' + e.message);
    }
  };

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>QA Inspection Report (PDF)</h3>
      <p style={{ color: '#4b5563', fontSize: 14 }}>
        Synthesizes a multi-line PDF summarizing defect counts, top defect type,
        worst-performing station, and active inspection rules.
      </p>
      <div style={{ display: 'flex', gap: 12, marginTop: 12, alignItems: 'center' }}>
        <button
          onClick={download}
          style={{
            padding: '8px 16px',
            background: '#2563eb',
            color: '#fff',
            border: 0,
            borderRadius: 6,
            cursor: 'pointer'
          }}
        >
          Download PDF
        </button>
        <a
          href={url}
          target="_blank"
          rel="noreferrer"
          style={{
            padding: '8px 16px',
            background: '#f3f4f6',
            color: '#111827',
            borderRadius: 6,
            textDecoration: 'none'
          }}
        >
          Open in new tab
        </a>
        <span style={{ color: '#6b7280', fontSize: 13 }}>{status}</span>
      </div>
    </div>
  );
}
