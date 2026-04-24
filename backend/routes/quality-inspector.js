const express = require('express');
const { QualityInspection, Product } = require('../models');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Get all quality inspections
router.get('/', async (req, res) => {
  try {
    const inspections = await QualityInspection.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'category'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(inspections);
  } catch (error) {
    console.error('Error fetching quality inspections:', error);
    res.status(500).json({ error: 'Failed to fetch quality inspections' });
  }
});

// Get single inspection
router.get('/:id', async (req, res) => {
  try {
    const inspection = await QualityInspection.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!inspection) {
      return res.status(404).json({ error: 'Quality inspection not found' });
    }
    res.json(inspection);
  } catch (error) {
    console.error('Error fetching quality inspection:', error);
    res.status(500).json({ error: 'Failed to fetch quality inspection' });
  }
});

// Create new quality inspection (with AI analysis)
router.post('/', async (req, res) => {
  try {
    const { product_id, inspection_name, batch_number, inspection_type, inspector_name, parameters, run_ai } = req.body;

    let ai_analysis = null;
    let quality_score = null;
    let status = 'pending';
    let findings = null;

    if (run_ai !== false) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.performQualityInspection({
        inspection_name,
        product_name: product?.name,
        batch_number,
        inspection_type,
        parameters
      });
      ai_analysis = aiResult.analysis;
      quality_score = ai_analysis?.inspection_result?.quality_score;
      status = ai_analysis?.inspection_result?.overall_status || 'needs_review';
      findings = ai_analysis?.findings;
    }

    const inspection = await QualityInspection.create({
      product_id: product_id || null,
      inspection_name,
      batch_number,
      inspection_type,
      inspector_name,
      status,
      quality_score,
      parameters,
      findings,
      ai_analysis
    });

    const fullInspection = await QualityInspection.findByPk(inspection.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.status(201).json(fullInspection);
  } catch (error) {
    console.error('Error creating quality inspection:', error);
    res.status(500).json({ error: error.message || 'Failed to create quality inspection' });
  }
});

// Update quality inspection
router.put('/:id', async (req, res) => {
  try {
    const inspection = await QualityInspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Quality inspection not found' });
    }

    const { product_id, inspection_name, batch_number, inspection_type, inspector_name, status, parameters, rerun_ai } = req.body;

    let updateData = { product_id: product_id || null, inspection_name, batch_number, inspection_type, inspector_name, status, parameters };

    if (rerun_ai) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.performQualityInspection({
        inspection_name: inspection_name || inspection.inspection_name,
        product_name: product?.name,
        batch_number: batch_number || inspection.batch_number,
        inspection_type: inspection_type || inspection.inspection_type,
        parameters: parameters || inspection.parameters
      });
      updateData.ai_analysis = aiResult.analysis;
      updateData.quality_score = aiResult.analysis?.inspection_result?.quality_score;
      updateData.status = aiResult.analysis?.inspection_result?.overall_status || status;
      updateData.findings = aiResult.analysis?.findings;
    }

    await inspection.update(updateData);

    const updatedInspection = await QualityInspection.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.json(updatedInspection);
  } catch (error) {
    console.error('Error updating quality inspection:', error);
    res.status(500).json({ error: 'Failed to update quality inspection' });
  }
});

// Delete quality inspection
router.delete('/:id', async (req, res) => {
  try {
    const inspection = await QualityInspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Quality inspection not found' });
    }
    await inspection.destroy();
    res.json({ message: 'Quality inspection deleted successfully' });
  } catch (error) {
    console.error('Error deleting quality inspection:', error);
    res.status(500).json({ error: 'Failed to delete quality inspection' });
  }
});

// Run AI analysis only
router.post('/:id/analyze', async (req, res) => {
  try {
    const inspection = await QualityInspection.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!inspection) {
      return res.status(404).json({ error: 'Quality inspection not found' });
    }

    const aiResult = await openRouterService.performQualityInspection({
      inspection_name: inspection.inspection_name,
      product_name: inspection.product?.name,
      batch_number: inspection.batch_number,
      inspection_type: inspection.inspection_type,
      parameters: inspection.parameters
    });

    await inspection.update({
      ai_analysis: aiResult.analysis,
      quality_score: aiResult.analysis?.inspection_result?.quality_score,
      status: aiResult.analysis?.inspection_result?.overall_status || inspection.status,
      findings: aiResult.analysis?.findings
    });

    const updatedInspection = await QualityInspection.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.json(updatedInspection);
  } catch (error) {
    console.error('Error running AI analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to run AI analysis' });
  }
});

module.exports = router;
