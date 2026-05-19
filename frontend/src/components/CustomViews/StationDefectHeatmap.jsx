import React, { useEffect, useState } from 'react';
import axios from 'axios';

function colorFor(value, max) {
  if (max <= 0) return '#f3f4f6';
  const t = value / max;
  // light yellow -> red
  const r = Math.round(255);
  const g = Math.round(237 - t * 200);
  const b = Math.round(160 - t * 160);
  return `rgb(${r},${g},${b})`;
}

export default function StationDefectHeatmap() {
  const [data, setData] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    axios
      .get('/api/custom-views/station-defect-heatmap')
      .then((r) => setData(r.data))
      .catch((e) => setErr(e.message));
  }, []);

  if (err) return <div style={{ color: '#ef4444' }}>Error: {err}</div>;
  if (!data) return <div>Loading station heatmap...</div>;

  const getCount = (station, dType) =>
    data.cells.find((c) => c.station === station && c.defectType === dType)?.count ?? 0;

  return (
    <div style={{ background: '#fff', padding: 16, borderRadius: 8, boxShadow: '0 1px 3px rgba(0,0,0,0.08)' }}>
      <h3 style={{ marginTop: 0 }}>{data.title}</h3>
      <div style={{ overflowX: 'auto' }}>
        <table style={{ borderCollapse: 'collapse', minWidth: 480 }}>
          <thead>
            <tr>
              <th style={{ padding: 8, textAlign: 'left', background: '#f9fafb' }}>Station \\ Defect</th>
              {data.defectTypes.map((d) => (
                <th key={d} style={{ padding: 8, fontSize: 12, background: '#f9fafb' }}>{d}</th>
              ))}
              <th style={{ padding: 8, fontSize: 12, background: '#f9fafb' }}>Total</th>
            </tr>
          </thead>
          <tbody>
            {data.stations.map((s) => {
              const rowTotal = data.stationTotals.find((t) => t.station === s)?.total ?? 0;
              return (
                <tr key={s}>
                  <td style={{ padding: 8, fontWeight: 600, fontSize: 13 }}>{s}</td>
                  {data.defectTypes.map((d) => {
                    const v = getCount(s, d);
                    return (
                      <td
                        key={d}
                        title={`${s} / ${d}: ${v}`}
                        style={{
                          padding: 12,
                          textAlign: 'center',
                          background: colorFor(v, data.maxCount),
                          color: v > data.maxCount * 0.6 ? '#fff' : '#111827',
                          fontWeight: 600,
                          fontSize: 13,
                          border: '1px solid #fff'
                        }}
                      >
                        {v}
                      </td>
                    );
                  })}
                  <td style={{ padding: 8, fontWeight: 700, textAlign: 'right' }}>{rowTotal}</td>
                </tr>
              );
            })}
            <tr>
              <td style={{ padding: 8, fontWeight: 700, background: '#f9fafb' }}>Defect total</td>
              {data.defectTypes.map((d) => {
                const t = data.defectTotals.find((x) => x.defectType === d)?.total ?? 0;
                return <td key={d} style={{ padding: 8, fontWeight: 700, textAlign: 'center', background: '#f9fafb' }}>{t}</td>;
              })}
              <td style={{ padding: 8, fontWeight: 700, background: '#f9fafb', textAlign: 'right' }}>
                {data.cells.reduce((a, c) => a + c.count, 0)}
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p style={{ fontSize: 12, color: '#6b7280', marginTop: 8 }}>
        Color = defect count intensity per station / type. Higher = darker.
      </p>
    </div>
  );
}
