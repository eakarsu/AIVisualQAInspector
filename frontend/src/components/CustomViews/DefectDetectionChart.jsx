import React, { useEffect, useState } from 'react';
import axios from 'axios';

const COLORS = ['#2563eb', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4'];

export default function DefectDetectionChart() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    axios
      .get('/api/custom-views/defect-detection-chart')
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div>Loading defect detection chart...</div>;

  const W = 720;
  const H = 260;
  const PAD = 36;
  const max = data.series.reduce(
    (m, s) => Math.max(m, ...s.data),
    1
  );
  const xStep = (W - PAD * 2) / (data.days.length - 1 || 1);
  const yScale = (v) => H - PAD - (v / max) * (H - PAD * 2);

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>{data.title}</h3>
      <svg width={W} height={H} role="img" aria-label="Defect detection chart">
        {/* axes */}
        <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="#9ca3af" />
        <line x1={PAD} y1={PAD} x2={PAD} y2={H - PAD} stroke="#9ca3af" />
        {/* gridlines */}
        {[0.25, 0.5, 0.75, 1].map((t) => (
          <line key={t} x1={PAD} x2={W - PAD} y1={H - PAD - t * (H - PAD * 2)} y2={H - PAD - t * (H - PAD * 2)} stroke="#e5e7eb" />
        ))}
        {/* lines per series */}
        {data.series.map((s, idx) => {
          const pts = s.data
            .map((v, i) => `${PAD + i * xStep},${yScale(v)}`)
            .join(' ');
          return (
            <polyline
              key={s.defectType}
              points={pts}
              fill="none"
              stroke={COLORS[idx % COLORS.length]}
              strokeWidth="2"
            />
          );
        })}
        {/* x-axis day labels (every other) */}
        {data.days.map((d, i) =>
          i % 2 === 0 ? (
            <text key={d} x={PAD + i * xStep} y={H - PAD + 14} fontSize="10" textAnchor="middle" fill="#6b7280">
              {d.slice(5)}
            </text>
          ) : null
        )}
      </svg>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginTop: 8 }}>
        {data.series.map((s, idx) => (
          <span key={s.defectType} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12 }}>
            <span style={{ width: 12, height: 12, background: COLORS[idx % COLORS.length], display: 'inline-block', borderRadius: 2 }} />
            {s.defectType} ({s.data.reduce((a, b) => a + b, 0)})
          </span>
        ))}
      </div>
    </div>
  );
}
