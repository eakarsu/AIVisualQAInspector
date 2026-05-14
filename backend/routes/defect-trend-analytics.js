const express = require('express');
const { Defect, Product, AIResult } = require('../models');
const { Op } = require('sequelize');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// GET time-series defect trends by product/line
router.get('/time-series', async (req, res) => {
  try {
    const { product_id, days = 30 } = req.query;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);

    const where = { created_at: { [Op.gte]: since } };
    if (product_id) where.product_id = parseInt(product_id);

    const defects = await Defect.findAll({
      where,
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'category'] }],
      order: [['created_at', 'ASC']],
    });

    // Group by date
    const byDate = {};
    for (const d of defects) {
      const date = d.created_at.toISOString().slice(0, 10);
      if (!byDate[date]) byDate[date] = { date, count: 0, critical: 0, high: 0, medium: 0, low: 0, defect_types: {} };
      byDate[date].count++;
      const sev = (d.severity || 'low').toLowerCase();
      if (byDate[date][sev] !== undefined) byDate[date][sev]++;
      const dt = d.defect_type || 'unknown';
      byDate[date].defect_types[dt] = (byDate[date].defect_types[dt] || 0) + 1;
    }

    const byProduct = {};
    for (const d of defects) {
      const pid = d.product_id;
      if (!byProduct[pid]) byProduct[pid] = { product_id: pid, product_name: d.product?.name, count: 0, types: {} };
      byProduct[pid].count++;
      const dt = d.defect_type || 'unknown';
      byProduct[pid].types[dt] = (byProduct[pid].types[dt] || 0) + 1;
    }

    res.json({
      time_series: Object.values(byDate),
      by_product: Object.values(byProduct),
      total_defects: defects.length,
      date_range: { from: since.toISOString().slice(0, 10), to: new Date().toISOString().slice(0, 10) }
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// POST AI-powered trend analysis
router.post('/analyze', async (req, res) => {
  try {
    const { product_id, days = 30 } = req.body;
    const since = new Date(Date.now() - parseInt(days) * 24 * 60 * 60 * 1000);
    const where = { created_at: { [Op.gte]: since } };
    if (product_id) where.product_id = parseInt(product_id);

    const defects = await Defect.findAll({
      where,
      include: [{ model: Product, as: 'product', attributes: ['name', 'sku', 'category'] }],
      order: [['created_at', 'ASC']],
    });

    const summary = defects.map(d => ({
      date: d.created_at.toISOString().slice(0, 10),
      type: d.defect_type,
      severity: d.severity,
      product: d.product?.name,
      description: d.description
    }));

    const prompt = `You are a manufacturing QA trend analyst. Analyze ${defects.length} defects from the last ${days} days.

Defects data:
${JSON.stringify(summary.slice(0, 100))}

Return JSON: {
  "trend_summary": "string",
  "worsening_areas": [{"defect_type": "string", "trend": "string", "recommendation": "string"}],
  "improving_areas": [{"defect_type": "string", "trend": "string"}],
  "root_cause_hypotheses": ["string"],
  "predicted_next_week": {"estimated_count": number, "high_risk_types": ["string"]},
  "priority_actions": ["string"],
  "quality_score": number
}`;

    const text = await openRouterService.makeRequest(prompt);
    const parsed = openRouterService.parseAIJson(JSON.stringify(text));

    await AIResult.create({
      user_id: req.user?.id || null,
      endpoint: 'defect-trend-analytics/analyze',
      input_data: { product_id, days },
      result_text: JSON.stringify(text),
      parsed_result: parsed,
    });

    res.json({ analysis: parsed || text, defect_count: defects.length });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
