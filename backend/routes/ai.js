const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 10 * 1024 * 1024 }, // 10MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.'));
    }
  }
});

// Analyze uploaded image
router.post('/analyze', upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No image file provided' });
    }

    const imageBuffer = fs.readFileSync(req.file.path);
    const mimeType = req.file.mimetype;

    const result = await openRouterService.analyzeImage(imageBuffer, mimeType);

    // Clean up uploaded file
    fs.unlinkSync(req.file.path);

    res.json(result);
  } catch (error) {
    console.error('AI analysis error:', error);

    // Clean up uploaded file on error
    if (req.file && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    res.status(500).json({
      error: error.message || 'Failed to analyze image',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// Analyze image from URL
router.post('/analyze-url', async (req, res) => {
  try {
    const { imageUrl } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ error: 'Image URL is required' });
    }

    const result = await openRouterService.analyzeImageFromUrl(imageUrl);
    res.json(result);
  } catch (error) {
    console.error('AI analysis error:', error);
    res.status(500).json({
      error: error.message || 'Failed to analyze image',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

// POST /api/ai/predictive-quality
// Predict if a production run is likely to exceed defect rate
router.post('/predictive-quality', async (req, res) => {
  try {
    const { productLine, recentDefects, productionParams, historicalRate } = req.body || {};
    const systemPrompt = 'You are a manufacturing quality engineer. Always respond with valid JSON.';
    const prompt = `Predict whether the upcoming production run will exceed acceptable defect rates.

Product line: ${productLine || 'unknown'}
Recent defects (counts/types): ${JSON.stringify(recentDefects || [])}
Production parameters (temp/speed/material/etc.): ${JSON.stringify(productionParams || {})}
Historical defect rate: ${historicalRate ?? 'unknown'}

Return JSON:
{
  "predictedDefectRate": 0,
  "exceedsThreshold": false,
  "confidence": "low|medium|high",
  "topRiskFactors": ["..."],
  "recommendedAdjustments": ["..."],
  "summary": ""
}`;
    const result = await openRouterService.makeRequest(prompt, systemPrompt);
    res.json(result);
  } catch (error) {
    console.error('Predictive quality error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/improvement-recommendations
// Suggest process changes to reduce defect rates
router.post('/improvement-recommendations', async (req, res) => {
  try {
    const { defectStats, processData, constraints } = req.body || {};
    const systemPrompt = 'You are a continuous-improvement / Six Sigma consultant. Always respond with valid JSON.';
    const prompt = `Recommend process changes to reduce defect rates.

Defect stats: ${JSON.stringify(defectStats || {})}
Process data: ${JSON.stringify(processData || {})}
Constraints: ${JSON.stringify(constraints || {})}

Return JSON:
{
  "recommendations": [{ "action": "", "rationale": "", "expectedDefectReductionPct": 0, "implementationCost": "low|medium|high", "priority": "low|medium|high" }],
  "quickWins": ["..."],
  "longerTermInitiatives": ["..."],
  "summary": ""
}`;
    const result = await openRouterService.makeRequest(prompt, systemPrompt);
    res.json(result);
  } catch (error) {
    console.error('Improvement recommendation error:', error);
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/supplier-quality-score
// Score a supplier's quality based on historical defect / rework / on-time data
router.post('/supplier-quality-score', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }

    const {
      supplierName,
      productCategory,
      lookbackDays,
      defectStats,
      onTimeDeliveryPct,
      reworkRatePct,
      certifications,
      auditFindings,
      historicalIncidents,
    } = req.body || {};

    const systemPrompt = 'You are a supplier quality manager (AS9100/IATF auditor). Always respond with valid JSON.';
    const prompt = `Score this supplier's quality based on the historical data.

Supplier: ${supplierName || 'unknown'}
Product category: ${productCategory || 'unknown'}
Lookback (days): ${lookbackDays ?? 'unspecified'}
Defect stats (counts/types/PPM): ${JSON.stringify(defectStats || {})}
On-time delivery %: ${onTimeDeliveryPct ?? 'unspecified'}
Rework rate %: ${reworkRatePct ?? 'unspecified'}
Certifications: ${JSON.stringify(certifications || [])}
Audit findings: ${JSON.stringify(auditFindings || [])}
Historical incidents: ${JSON.stringify(historicalIncidents || [])}

Return JSON:
{
  "supplier": "",
  "overallScore": 0,
  "grade": "A|B|C|D|F",
  "tier": "preferred|approved|conditional|probation|disqualified",
  "subscores": {
    "qualityPpm": 0,
    "deliveryReliability": 0,
    "responsiveness": 0,
    "certificationStrength": 0,
    "incidentHistory": 0
  },
  "topRisks": ["..."],
  "topStrengths": ["..."],
  "recommendedActions": [{ "action": "", "priority": "high|medium|low", "owner": "" }],
  "monitoringCadence": "",
  "summary": ""
}`;
    const result = await openRouterService.makeRequest(prompt, systemPrompt);
    res.json(result);
  } catch (error) {
    console.error('Supplier quality score error:', error);
    if (error && error.message && error.message.includes('not configured')) {
      return res.status(503).json({ error: 'AI service unavailable: OPENROUTER_API_KEY not configured' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/defect-parameter-correlation
// Correlate defect rates with process parameter shifts (MECHANICAL backlog item).
// ENV VARS: OPENROUTER_API_KEY required (returns 503 with missing flag if unset).
router.post('/defect-parameter-correlation', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
      return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    }
    const { productLine, defectSeries, parameterSeries, lookbackDays } = req.body || {};
    const systemPrompt = 'You are a manufacturing data scientist specializing in defect-vs-parameter correlation. Always respond with valid JSON.';
    const prompt = `Correlate defect rates with process parameter shifts and identify the parameters most likely driving defects.

Product line: ${productLine || 'unknown'}
Lookback (days): ${lookbackDays ?? 'unspecified'}
Defect series (timestamped counts/types): ${JSON.stringify(defectSeries || []).slice(0, 6000)}
Parameter series (timestamped temp/speed/pressure/material lots): ${JSON.stringify(parameterSeries || []).slice(0, 6000)}

Return JSON:
{
  "correlations": [{ "parameter": "", "defect_type": "", "correlation": 0, "lag_minutes": 0, "direction": "positive|negative", "confidence": "low|medium|high" }],
  "topRootCauses": [{ "cause": "", "evidence": "", "priority": "low|medium|high" }],
  "recommendedExperiments": ["..."],
  "monitoringSuggestions": ["..."],
  "summary": ""
}`;
    const result = await openRouterService.makeRequest(prompt, systemPrompt);
    res.json(result);
  } catch (error) {
    console.error('Defect-parameter correlation error:', error);
    if (error && error.message && error.message.includes('not configured')) {
      return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    }
    res.status(500).json({ error: error.message });
  }
});

// POST /api/ai/spc-control-chart
// Compute SPC control chart limits and out-of-control signals from a series of
// measurements, then have AI summarize patterns / recommended actions.
// PRODUCT-DECISION: Real-time streaming SPC was originally listed as substantive
// new domain feature. This is a synchronous REST batch endpoint that returns
// X-bar / R control limits using Shewhart constants for n<=10. Live streaming
// is a future product decision.
router.post('/spc-control-chart', async (req, res) => {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey || apiKey === 'your-openrouter-api-key-here') {
      return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    }
    const { measurement, subgroups, target } = req.body || {};
    if (!Array.isArray(subgroups) || subgroups.length === 0) {
      return res.status(400).json({ error: 'subgroups must be a non-empty array of arrays' });
    }
    const validSubgroups = subgroups.filter((s) => Array.isArray(s) && s.length > 0);
    if (validSubgroups.length === 0) {
      return res.status(400).json({ error: 'subgroups must contain at least one non-empty inner array' });
    }
    const n = validSubgroups[0].length;
    // Shewhart A2 / D3 / D4 constants for n in [2..10]
    const A2 = { 2: 1.880, 3: 1.023, 4: 0.729, 5: 0.577, 6: 0.483, 7: 0.419, 8: 0.373, 9: 0.337, 10: 0.308 };
    const D3 = { 2: 0,     3: 0,     4: 0,     5: 0,     6: 0,     7: 0.076, 8: 0.136, 9: 0.184, 10: 0.223 };
    const D4 = { 2: 3.267, 3: 2.575, 4: 2.282, 5: 2.115, 6: 2.004, 7: 1.924, 8: 1.864, 9: 1.816, 10: 1.777 };

    const means = validSubgroups.map((s) => s.reduce((a, b) => a + Number(b || 0), 0) / s.length);
    const ranges = validSubgroups.map((s) => Math.max(...s.map(Number)) - Math.min(...s.map(Number)));
    const xbar = means.reduce((a, b) => a + b, 0) / means.length;
    const rbar = ranges.reduce((a, b) => a + b, 0) / ranges.length;
    let limits = null;
    if (n >= 2 && n <= 10) {
      limits = {
        UCL_x: xbar + A2[n] * rbar,
        CL_x: xbar,
        LCL_x: xbar - A2[n] * rbar,
        UCL_r: D4[n] * rbar,
        CL_r: rbar,
        LCL_r: D3[n] * rbar,
      };
    }
    // Detect out-of-control points (Western Electric Rule 1: any point > UCL or < LCL)
    const outOfControl = limits
      ? means.map((m, i) => ({ index: i, mean: m, range: ranges[i], outOfControl: m > limits.UCL_x || m < limits.LCL_x || ranges[i] > limits.UCL_r }))
        .filter((p) => p.outOfControl)
      : [];

    const systemPrompt = 'You are a quality / SPC engineer. Always respond with valid JSON.';
    const prompt = `Interpret the SPC X-bar / R chart computed for ${measurement || 'measurement'} (target=${target ?? 'unspecified'}).

Subgroup size n = ${n}
Subgroup means: ${JSON.stringify(means).slice(0, 4000)}
Subgroup ranges: ${JSON.stringify(ranges).slice(0, 4000)}
Limits: ${JSON.stringify(limits)}
Out-of-control points: ${JSON.stringify(outOfControl)}

Return JSON:
{
  "process_state": "in-control|out-of-control|trending",
  "western_electric_signals": [{ "rule": "", "indices": [] }],
  "trends": [{ "direction": "up|down", "indices": [] }],
  "recommended_actions": ["..."],
  "capability_hint": "",
  "summary": ""
}`;
    const aiResult = await openRouterService.makeRequest(prompt, systemPrompt);
    res.json({ measurement: measurement || null, n, xbar, rbar, limits, out_of_control: outOfControl, ai: aiResult });
  } catch (error) {
    console.error('SPC control chart error:', error);
    if (error && error.message && error.message.includes('not configured')) {
      return res.status(503).json({ error: 'AI service unavailable', missing: 'OPENROUTER_API_KEY' });
    }
    res.status(500).json({ error: error.message });
  }
});

// Check API status
router.get('/status', (req, res) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  const isConfigured = apiKey && apiKey !== 'your-openrouter-api-key-here';

  res.json({
    configured: isConfigured,
    model: process.env.OPENROUTER_MODEL || 'anthropic/claude-haiku-4.5'
  });
});

module.exports = router;
