/**
 * Custom Views Routes
 * 4 endpoints for visual QA inspection custom views:
 *  - GET  /api/custom-views/defect-detection-chart  (VIZ)
 *  - GET  /api/custom-views/station-defect-heatmap  (VIZ)
 *  - GET  /api/custom-views/qa-inspection-report-pdf (NON-VIZ)
 *  - GET/POST/PUT/DELETE /api/custom-views/inspection-rules (NON-VIZ, CRUD per product line)
 *
 * Notes:
 *  - This file uses rate limiter with ipKeyGenerator helper to safely
 *    derive a key when req.user.id is not present (IPv6-safe).
 */
const express = require('express');
const rateLimit = require('express-rate-limit');
let ipKeyGenerator;
try {
  ({ ipKeyGenerator } = require('express-rate-limit'));
} catch (_) {
  ipKeyGenerator = (req) => req.ip;
}

const router = express.Router();

// Rate limiter (IPv6 safe via ipKeyGenerator)
const cvLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 120,
  standardHeaders: true,
  legacyHeaders: false,
  keyGenerator: (req, res) => {
    if (req.user && req.user.id) return String(req.user.id);
    if (typeof ipKeyGenerator === 'function') return ipKeyGenerator(req, res);
    return req.ip;
  }
});

router.use(cvLimiter);

/**
 * In-memory inspection rules store (per product line).
 * Seeded with a small but realistic set. Persists for the lifetime of the
 * process — sufficient for this custom views feature.
 */
const inspectionRules = [
  {
    id: 1,
    productLine: 'Automotive Body Panels',
    ruleName: 'Surface scratch tolerance',
    metric: 'scratch_length_mm',
    operator: '<=',
    threshold: 2.0,
    severityOnFail: 'medium',
    active: true,
    createdAt: '2026-04-01T08:00:00.000Z'
  },
  {
    id: 2,
    productLine: 'Automotive Body Panels',
    ruleName: 'Dent depth maximum',
    metric: 'dent_depth_mm',
    operator: '<',
    threshold: 0.5,
    severityOnFail: 'high',
    active: true,
    createdAt: '2026-04-02T08:00:00.000Z'
  },
  {
    id: 3,
    productLine: 'PCB Assembly',
    ruleName: 'Solder bridge count',
    metric: 'solder_bridges',
    operator: '==',
    threshold: 0,
    severityOnFail: 'critical',
    active: true,
    createdAt: '2026-04-03T08:00:00.000Z'
  },
  {
    id: 4,
    productLine: 'Pharmaceutical Bottling',
    ruleName: 'Label alignment offset',
    metric: 'label_offset_mm',
    operator: '<=',
    threshold: 1.0,
    severityOnFail: 'medium',
    active: true,
    createdAt: '2026-04-04T08:00:00.000Z'
  }
];
let nextRuleId = 5;

// Seed data for charts — deterministic so the visualizations are stable.
const DEFECT_TYPES = ['Scratch', 'Dent', 'Misalignment', 'Discoloration', 'CrackedSurface', 'MissingPart'];
const STATIONS = ['Station-A', 'Station-B', 'Station-C', 'Station-D', 'Station-E'];

function buildDefectDetectionSeries() {
  // 14 days of detection counts per defect type
  const today = new Date('2026-05-18T00:00:00.000Z');
  const days = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(today);
    d.setUTCDate(today.getUTCDate() - i);
    days.push(d.toISOString().slice(0, 10));
  }
  const series = DEFECT_TYPES.map((defectType, idx) => {
    const data = days.map((_, dayIdx) => {
      // pseudo-deterministic count
      const base = (idx + 1) * 3;
      const wave = Math.round(Math.sin((dayIdx + idx) / 2) * 4 + 6);
      return Math.max(0, base + wave - (dayIdx % 4));
    });
    return { defectType, data };
  });
  return { days, series };
}

function buildStationDefectHeatmap() {
  // Counts per (station, defectType)
  const cells = [];
  STATIONS.forEach((station, sIdx) => {
    DEFECT_TYPES.forEach((defectType, dIdx) => {
      const count = ((sIdx + 1) * (dIdx + 2) * 7 + (sIdx * dIdx)) % 41;
      cells.push({ station, defectType, count });
    });
  });
  // Compute totals per row/col
  const stationTotals = STATIONS.map((s) => ({
    station: s,
    total: cells.filter((c) => c.station === s).reduce((a, c) => a + c.count, 0)
  }));
  const defectTotals = DEFECT_TYPES.map((d) => ({
    defectType: d,
    total: cells.filter((c) => c.defectType === d).reduce((a, c) => a + c.count, 0)
  }));
  return {
    stations: STATIONS,
    defectTypes: DEFECT_TYPES,
    cells,
    stationTotals,
    defectTotals,
    maxCount: cells.reduce((m, c) => Math.max(m, c.count), 0)
  };
}

/**
 * GET /defect-detection-chart  (VIZ)
 * Returns 14-day series of defect detection counts per defect type
 * suitable for a multi-line / stacked chart.
 */
router.get('/defect-detection-chart', (req, res) => {
  const series = buildDefectDetectionSeries();
  const totals = series.series.map((s) => ({
    defectType: s.defectType,
    total: s.data.reduce((a, b) => a + b, 0)
  }));
  res.json({
    title: 'Defect Detection Trend (14 days)',
    windowDays: 14,
    days: series.days,
    series: series.series,
    totals,
    generatedAt: new Date().toISOString()
  });
});

/**
 * GET /station-defect-heatmap  (VIZ)
 * Returns matrix of defect counts: stations x defect types.
 */
router.get('/station-defect-heatmap', (req, res) => {
  const data = buildStationDefectHeatmap();
  res.json({
    title: 'Station x Defect Type Heatmap',
    ...data,
    generatedAt: new Date().toISOString()
  });
});

/**
 * GET /qa-inspection-report-pdf  (NON-VIZ)
 * Returns a synthesized minimal PDF (1.4) inline so the client can either
 * download or open it. Spec: this is a *report* endpoint, not a chart.
 */
router.get('/qa-inspection-report-pdf', (req, res) => {
  const series = buildDefectDetectionSeries();
  const heat = buildStationDefectHeatmap();
  const totalDefects = series.series.reduce(
    (a, s) => a + s.data.reduce((x, y) => x + y, 0),
    0
  );
  const topDefect = [...series.series]
    .map((s) => ({ defectType: s.defectType, total: s.data.reduce((a, b) => a + b, 0) }))
    .sort((a, b) => b.total - a.total)[0];
  const worstStation = [...heat.stationTotals].sort((a, b) => b.total - a.total)[0];

  const lines = [
    'AI Visual QA Inspector',
    'Quality Assurance Inspection Report',
    `Generated: ${new Date().toISOString()}`,
    '',
    `Total defects detected (14d window): ${totalDefects}`,
    `Top defect type: ${topDefect.defectType} (${topDefect.total})`,
    `Worst-performing station: ${worstStation.station} (${worstStation.total} defects)`,
    `Active inspection rules: ${inspectionRules.filter((r) => r.active).length}`,
    '',
    'Detection by defect type:',
    ...series.series.map(
      (s) => `  - ${s.defectType}: ${s.data.reduce((a, b) => a + b, 0)} occurrences`
    )
  ];

  // Build a minimal PDF 1.4 with one page containing the lines.
  const escape = (s) =>
    s.replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)');
  let textBlock = 'BT\n/F1 12 Tf\n50 780 Td\n14 TL\n';
  lines.forEach((ln, i) => {
    if (i === 0) textBlock += `(${escape(ln)}) Tj\n`;
    else textBlock += `T*\n(${escape(ln)}) Tj\n`;
  });
  textBlock += 'ET';

  const objects = [];
  objects.push('1 0 obj\n<< /Type /Catalog /Pages 2 0 R >>\nendobj\n');
  objects.push('2 0 obj\n<< /Type /Pages /Kids [3 0 R] /Count 1 >>\nendobj\n');
  objects.push(
    '3 0 obj\n<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >>\nendobj\n'
  );
  objects.push(
    `4 0 obj\n<< /Length ${textBlock.length} >>\nstream\n${textBlock}\nendstream\nendobj\n`
  );
  objects.push('5 0 obj\n<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>\nendobj\n');

  let pdf = '%PDF-1.4\n';
  const offsets = [0];
  objects.forEach((o) => {
    offsets.push(Buffer.byteLength(pdf, 'utf8'));
    pdf += o;
  });
  const xrefOffset = Buffer.byteLength(pdf, 'utf8');
  pdf += `xref\n0 ${objects.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objects.length; i++) {
    pdf += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader(
    'Content-Disposition',
    'inline; filename="qa-inspection-report.pdf"'
  );
  res.send(Buffer.from(pdf, 'utf8'));
});

/**
 * Inspection Rules CRUD (NON-VIZ)
 *  GET    /inspection-rules            -> list (optional ?productLine=...)
 *  POST   /inspection-rules            -> create
 *  PUT    /inspection-rules/:id        -> update
 *  DELETE /inspection-rules/:id        -> delete
 */
router.get('/inspection-rules', (req, res) => {
  const { productLine } = req.query;
  const rules = productLine
    ? inspectionRules.filter(
        (r) => r.productLine.toLowerCase() === String(productLine).toLowerCase()
      )
    : inspectionRules;
  // distinct product lines for the UI selector
  const productLines = Array.from(new Set(inspectionRules.map((r) => r.productLine)));
  res.json({ rules, productLines, count: rules.length });
});

router.post('/inspection-rules', (req, res) => {
  const {
    productLine,
    ruleName,
    metric,
    operator,
    threshold,
    severityOnFail,
    active
  } = req.body || {};
  if (!productLine || !ruleName || !metric || !operator || threshold === undefined) {
    return res.status(400).json({
      error:
        'productLine, ruleName, metric, operator and threshold are required'
    });
  }
  const rule = {
    id: nextRuleId++,
    productLine: String(productLine),
    ruleName: String(ruleName),
    metric: String(metric),
    operator: String(operator),
    threshold: Number(threshold),
    severityOnFail: severityOnFail || 'medium',
    active: active !== false,
    createdAt: new Date().toISOString()
  };
  inspectionRules.push(rule);
  res.status(201).json({ rule });
});

router.put('/inspection-rules/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = inspectionRules.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'rule not found' });
  const cur = inspectionRules[idx];
  const updated = {
    ...cur,
    ...req.body,
    id: cur.id,
    createdAt: cur.createdAt
  };
  if (updated.threshold !== undefined) updated.threshold = Number(updated.threshold);
  inspectionRules[idx] = updated;
  res.json({ rule: updated });
});

router.delete('/inspection-rules/:id', (req, res) => {
  const id = Number(req.params.id);
  const idx = inspectionRules.findIndex((r) => r.id === id);
  if (idx === -1) return res.status(404).json({ error: 'rule not found' });
  const [removed] = inspectionRules.splice(idx, 1);
  res.json({ deleted: true, rule: removed });
});

module.exports = router;
