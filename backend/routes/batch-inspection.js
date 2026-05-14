const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { BatchInspection, Product, AIResult } = require('../models');
const openRouterService = require('../services/openrouter');

const router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = path.join(__dirname, '../uploads/batch');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${path.extname(file.originalname)}`);
  }
});
const upload = multer({ storage, limits: { fileSize: 10 * 1024 * 1024 } });

// List batch inspections with pagination
router.get('/', async (req, res) => {
  try {
    const page = Math.max(1, parseInt(req.query.page) || 1);
    const limit = Math.min(100, parseInt(req.query.limit) || 20);
    const offset = (page - 1) * limit;
    const { count, rows } = await BatchInspection.findAndCountAll({
      include: [{ model: Product, as: 'product', required: false, attributes: ['id', 'name', 'sku'] }],
      order: [['created_at', 'DESC']],
      limit,
      offset,
    });
    res.json({ data: rows, pagination: { page, limit, total: count, totalPages: Math.ceil(count / limit) } });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get single batch
router.get('/:id', async (req, res) => {
  try {
    const batch = await BatchInspection.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product', required: false }],
    });
    if (!batch) return res.status(404).json({ error: 'Batch inspection not found' });
    res.json(batch);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create batch and queue images for async processing
router.post('/', upload.array('images', 20), async (req, res) => {
  try {
    const { name, product_id } = req.body;
    if (!name) return res.status(400).json({ error: 'name is required' });

    const files = req.files || [];
    const batch = await BatchInspection.create({
      name,
      product_id: product_id ? parseInt(product_id) : null,
      status: 'processing',
      total_images: files.length,
      processed_images: 0,
      results: [],
    });

    // Process images asynchronously
    setImmediate(async () => {
      const results = [];
      for (const file of files) {
        try {
          const imageBuffer = fs.readFileSync(file.path);
          const analysisResult = await openRouterService.analyzeImage(imageBuffer, file.mimetype);
          results.push({ filename: file.originalname, analysis: analysisResult, status: 'completed' });
          fs.unlinkSync(file.path);
        } catch (err) {
          results.push({ filename: file.originalname, error: err.message, status: 'failed' });
          if (fs.existsSync(file.path)) fs.unlinkSync(file.path);
        }
        await batch.update({ processed_images: results.length, results });
      }

      // Generate aggregate report
      let aggregateReport = null;
      try {
        const defectSummary = results.filter(r => r.status === 'completed').map(r => JSON.stringify(r.analysis)).join('\n');
        const prompt = `You are a QA batch analysis expert. Summarize the following batch of ${results.length} image inspection results. Identify patterns, overall defect rate, most common defect types, and provide recommendations.

Results:
${defectSummary.slice(0, 5000)}

Return JSON: { "total_inspected": number, "passed": number, "failed": number, "defect_rate_pct": number, "common_defects": [string], "severity_breakdown": {"critical": 0, "high": 0, "medium": 0, "low": 0}, "recommendations": [string], "overall_quality_score": number }`;
        const text = await openRouterService.makeRequest(prompt);
        aggregateReport = openRouterService.parseAIJson(JSON.stringify(text)) || text;

        // Persist ai_result
        await AIResult.create({
          user_id: null,
          endpoint: 'batch-inspection/aggregate',
          input_data: { batch_id: batch.id, name, total_images: files.length },
          result_text: JSON.stringify(text),
          parsed_result: aggregateReport,
        });
      } catch (e) {
        aggregateReport = { error: e.message };
      }

      await batch.update({ status: 'completed', aggregate_report: aggregateReport });
    });

    res.status(201).json({ batch, message: `Batch created. Processing ${files.length} images asynchronously.` });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete batch
router.delete('/:id', async (req, res) => {
  try {
    const batch = await BatchInspection.findByPk(req.params.id);
    if (!batch) return res.status(404).json({ error: 'Not found' });
    await batch.destroy();
    res.json({ message: 'Batch deleted' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
