const express = require('express');
const { ReInspectionSchedule, Inspection, Product, AIResult } = require('../models');

const router = express.Router();

const CONFIDENCE_THRESHOLD = parseFloat(process.env.REINSPECTION_CONFIDENCE_THRESHOLD || '0.75');

// List pending re-inspections with pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;

    const where = {};
    if (req.query.status) where.status = req.query.status;

    const { count, rows } = await ReInspectionSchedule.findAndCountAll({
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

// Auto-schedule re-inspection based on confidence score
router.post('/auto-schedule', async (req, res) => {
  try {
    const { inspection_id, confidence_score, reason, product_id } = req.body;
    if (confidence_score === undefined) return res.status(400).json({ error: 'confidence_score is required' });

    if (confidence_score >= CONFIDENCE_THRESHOLD) {
      return res.json({ scheduled: false, message: `Confidence ${confidence_score} >= threshold ${CONFIDENCE_THRESHOLD}. Re-inspection not needed.` });
    }

    const priority = confidence_score < 0.5 ? 'high' : confidence_score < 0.65 ? 'normal' : 'low';
    const scheduledAt = new Date(Date.now() + (priority === 'high' ? 2 : priority === 'normal' ? 24 : 72) * 60 * 60 * 1000);

    const schedule = await ReInspectionSchedule.create({
      inspection_id: inspection_id || null,
      product_id: product_id || null,
      reason: reason || `Low confidence score: ${confidence_score}`,
      confidence_score,
      scheduled_at: scheduledAt,
      status: 'pending',
      priority,
    });

    res.status(201).json({
      scheduled: true,
      schedule,
      message: `Re-inspection scheduled for ${scheduledAt.toISOString()} with ${priority} priority.`
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Manual schedule
router.post('/', async (req, res) => {
  try {
    const { inspection_id, product_id, reason, scheduled_at, priority = 'normal' } = req.body;
    const schedule = await ReInspectionSchedule.create({
      inspection_id: inspection_id || null,
      product_id: product_id || null,
      reason: reason || 'Manual re-inspection request',
      scheduled_at: scheduled_at ? new Date(scheduled_at) : null,
      status: 'pending',
      priority,
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update status
router.put('/:id', async (req, res) => {
  try {
    const schedule = await ReInspectionSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Schedule not found' });
    const { status, scheduled_at, reason, priority } = req.body;
    await schedule.update({ status, scheduled_at, reason, priority });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete
router.delete('/:id', async (req, res) => {
  try {
    const schedule = await ReInspectionSchedule.findByPk(req.params.id);
    if (!schedule) return res.status(404).json({ error: 'Not found' });
    await schedule.destroy();
    res.json({ message: 'Deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
