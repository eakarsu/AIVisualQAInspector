const express = require('express');
const { MESAlert, Defect, Product } = require('../models');

const router = express.Router();

// List MES alerts with pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.acknowledged !== undefined) where.acknowledged = req.query.acknowledged === 'true';
    if (req.query.severity) where.severity = req.query.severity;
    if (req.query.line_id) where.line_id = req.query.line_id;

    const { count, rows } = await MESAlert.findAndCountAll({
      where,
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single alert
router.get('/:id', async (req, res) => {
  try {
    const alert = await MESAlert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Alert not found' });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create MES alert (triggered by defect detection)
router.post('/', async (req, res) => {
  try {
    const { defect_id, product_id, alert_type, severity, message, line_id } = req.body;
    if (!alert_type || !severity || !message) {
      return res.status(400).json({ error: 'alert_type, severity, and message are required' });
    }
    const alert = await MESAlert.create({
      defect_id: defect_id || null,
      product_id: product_id || null,
      alert_type,
      severity,
      message,
      line_id: line_id || null,
    });
    res.status(201).json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Trigger MES alert from defect
router.post('/from-defect', async (req, res) => {
  try {
    const { defect_id, line_id } = req.body;
    if (!defect_id) return res.status(400).json({ error: 'defect_id is required' });

    const defect = await Defect.findByPk(defect_id, {
      include: [{ model: Product, as: 'product', attributes: ['name', 'sku'] }],
    });
    if (!defect) return res.status(404).json({ error: 'Defect not found' });

    const severity = defect.severity || 'medium';
    const alertType = severity === 'critical' ? 'LINE_STOP' : severity === 'high' ? 'QUALITY_HOLD' : 'QUALITY_WARNING';
    const message = `[${alertType}] ${defect.defect_type} detected on ${defect.product?.name || 'Unknown Product'} (SKU: ${defect.product?.sku || 'N/A'}). Severity: ${severity.toUpperCase()}. ${defect.description || ''}`;

    const alert = await MESAlert.create({
      defect_id,
      product_id: defect.product_id,
      alert_type: alertType,
      severity,
      message,
      line_id: line_id || null,
    });

    res.status(201).json({ alert, message: `MES alert ${alertType} triggered for defect ${defect_id}` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Acknowledge alert
router.put('/:id/acknowledge', async (req, res) => {
  try {
    const alert = await MESAlert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Not found' });
    await alert.update({ acknowledged: true, acknowledged_at: new Date() });
    res.json(alert);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const alert = await MESAlert.findByPk(req.params.id);
    if (!alert) return res.status(404).json({ error: 'Not found' });
    await alert.destroy();
    res.json({ message: 'Alert deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Stats
router.get('/stats/summary', async (req, res) => {
  try {
    const total = await MESAlert.count();
    const unacknowledged = await MESAlert.count({ where: { acknowledged: false } });
    const critical = await MESAlert.count({ where: { severity: 'critical', acknowledged: false } });
    const high = await MESAlert.count({ where: { severity: 'high', acknowledged: false } });
    res.json({ total, unacknowledged, critical, high });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
