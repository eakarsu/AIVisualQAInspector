const express = require('express');
const { SeverityScore, Product, Defect } = require('../models');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Get all severity scores
router.get('/', async (req, res) => {
  try {
    const scores = await SeverityScore.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'category'] },
        { model: Defect, as: 'defect', attributes: ['id', 'defect_type', 'severity'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(scores);
  } catch (error) {
    console.error('Error fetching severity scores:', error);
    res.status(500).json({ error: 'Failed to fetch severity scores' });
  }
});

// Get single severity score
router.get('/:id', async (req, res) => {
  try {
    const score = await SeverityScore.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });
    if (!score) {
      return res.status(404).json({ error: 'Severity score not found' });
    }
    res.json(score);
  } catch (error) {
    console.error('Error fetching severity score:', error);
    res.status(500).json({ error: 'Failed to fetch severity score' });
  }
});

// Create new severity score (with AI analysis)
router.post('/', async (req, res) => {
  try {
    const { defect_id, product_id, issue_name, issue_description, severity_level, run_ai } = req.body;

    let ai_analysis = null;
    let severity_score = null;
    let impact_analysis = null;
    let final_severity_level = severity_level;

    if (run_ai !== false) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.scoreSeverity({
        issue_name,
        issue_description,
        product_name: product?.name
      });
      ai_analysis = aiResult.analysis;
      severity_score = ai_analysis?.severity_assessment?.overall_score || 50;
      impact_analysis = ai_analysis?.impact_analysis;
      final_severity_level = ai_analysis?.severity_assessment?.severity_level || severity_level;
    }

    const score = await SeverityScore.create({
      defect_id: defect_id || null,
      product_id: product_id || null,
      issue_name,
      issue_description,
      severity_level: final_severity_level,
      severity_score,
      impact_analysis,
      ai_analysis
    });

    const fullScore = await SeverityScore.findByPk(score.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });

    res.status(201).json(fullScore);
  } catch (error) {
    console.error('Error creating severity score:', error);
    res.status(500).json({ error: error.message || 'Failed to create severity score' });
  }
});

// Update severity score
router.put('/:id', async (req, res) => {
  try {
    const score = await SeverityScore.findByPk(req.params.id);
    if (!score) {
      return res.status(404).json({ error: 'Severity score not found' });
    }

    const { defect_id, product_id, issue_name, issue_description, severity_level, rerun_ai } = req.body;

    let updateData = { defect_id: defect_id || null, product_id: product_id || null, issue_name, issue_description, severity_level };

    if (rerun_ai) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.scoreSeverity({
        issue_name: issue_name || score.issue_name,
        issue_description: issue_description || score.issue_description,
        product_name: product?.name
      });
      updateData.ai_analysis = aiResult.analysis;
      updateData.severity_score = aiResult.analysis?.severity_assessment?.overall_score || 50;
      updateData.impact_analysis = aiResult.analysis?.impact_analysis;
      updateData.severity_level = aiResult.analysis?.severity_assessment?.severity_level || severity_level;
    }

    await score.update(updateData);

    const updatedScore = await SeverityScore.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });

    res.json(updatedScore);
  } catch (error) {
    console.error('Error updating severity score:', error);
    res.status(500).json({ error: 'Failed to update severity score' });
  }
});

// Delete severity score
router.delete('/:id', async (req, res) => {
  try {
    const score = await SeverityScore.findByPk(req.params.id);
    if (!score) {
      return res.status(404).json({ error: 'Severity score not found' });
    }
    await score.destroy();
    res.json({ message: 'Severity score deleted successfully' });
  } catch (error) {
    console.error('Error deleting severity score:', error);
    res.status(500).json({ error: 'Failed to delete severity score' });
  }
});

// Run AI analysis only
router.post('/:id/analyze', async (req, res) => {
  try {
    const score = await SeverityScore.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!score) {
      return res.status(404).json({ error: 'Severity score not found' });
    }

    const aiResult = await openRouterService.scoreSeverity({
      issue_name: score.issue_name,
      issue_description: score.issue_description,
      product_name: score.product?.name
    });

    await score.update({
      ai_analysis: aiResult.analysis,
      severity_score: aiResult.analysis?.severity_assessment?.overall_score || 50,
      impact_analysis: aiResult.analysis?.impact_analysis,
      severity_level: aiResult.analysis?.severity_assessment?.severity_level || score.severity_level
    });

    const updatedScore = await SeverityScore.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });

    res.json(updatedScore);
  } catch (error) {
    console.error('Error running AI analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to run AI analysis' });
  }
});

module.exports = router;
