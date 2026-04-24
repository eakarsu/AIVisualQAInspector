const express = require('express');
const { RootCauseAnalysis, Product, Defect } = require('../models');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Get all root cause analyses
router.get('/', async (req, res) => {
  try {
    const analyses = await RootCauseAnalysis.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'category'] },
        { model: Defect, as: 'defect', attributes: ['id', 'defect_type', 'severity'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching root cause analyses:', error);
    res.status(500).json({ error: 'Failed to fetch root cause analyses' });
  }
});

// Get single analysis
router.get('/:id', async (req, res) => {
  try {
    const analysis = await RootCauseAnalysis.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });
    if (!analysis) {
      return res.status(404).json({ error: 'Root cause analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching root cause analysis:', error);
    res.status(500).json({ error: 'Failed to fetch root cause analysis' });
  }
});

// Create new root cause analysis (with AI analysis)
router.post('/', async (req, res) => {
  try {
    const { defect_id, product_id, problem_name, problem_description, run_ai } = req.body;

    let ai_analysis = null;
    let root_causes = null;
    let contributing_factors = null;
    let corrective_actions = null;
    let preventive_measures = null;

    if (run_ai !== false) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.analyzeRootCause({
        problem_name,
        problem_description,
        product_name: product?.name
      });
      ai_analysis = aiResult.analysis;
      root_causes = ai_analysis?.five_whys_analysis;
      contributing_factors = ai_analysis?.contributing_factors;
      corrective_actions = ai_analysis?.corrective_actions;
      preventive_measures = ai_analysis?.preventive_measures;
    }

    const analysis = await RootCauseAnalysis.create({
      defect_id: defect_id || null,
      product_id: product_id || null,
      problem_name,
      problem_description,
      root_causes,
      contributing_factors,
      corrective_actions,
      preventive_measures,
      ai_analysis
    });

    const fullAnalysis = await RootCauseAnalysis.findByPk(analysis.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });

    res.status(201).json(fullAnalysis);
  } catch (error) {
    console.error('Error creating root cause analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to create root cause analysis' });
  }
});

// Update root cause analysis
router.put('/:id', async (req, res) => {
  try {
    const analysis = await RootCauseAnalysis.findByPk(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Root cause analysis not found' });
    }

    const { defect_id, product_id, problem_name, problem_description, rerun_ai } = req.body;

    let updateData = { defect_id: defect_id || null, product_id: product_id || null, problem_name, problem_description };

    if (rerun_ai) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.analyzeRootCause({
        problem_name: problem_name || analysis.problem_name,
        problem_description: problem_description || analysis.problem_description,
        product_name: product?.name
      });
      updateData.ai_analysis = aiResult.analysis;
      updateData.root_causes = aiResult.analysis?.five_whys_analysis;
      updateData.contributing_factors = aiResult.analysis?.contributing_factors;
      updateData.corrective_actions = aiResult.analysis?.corrective_actions;
      updateData.preventive_measures = aiResult.analysis?.preventive_measures;
    }

    await analysis.update(updateData);

    const updatedAnalysis = await RootCauseAnalysis.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });

    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Error updating root cause analysis:', error);
    res.status(500).json({ error: 'Failed to update root cause analysis' });
  }
});

// Delete root cause analysis
router.delete('/:id', async (req, res) => {
  try {
    const analysis = await RootCauseAnalysis.findByPk(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Root cause analysis not found' });
    }
    await analysis.destroy();
    res.json({ message: 'Root cause analysis deleted successfully' });
  } catch (error) {
    console.error('Error deleting root cause analysis:', error);
    res.status(500).json({ error: 'Failed to delete root cause analysis' });
  }
});

// Run AI analysis only
router.post('/:id/analyze', async (req, res) => {
  try {
    const analysis = await RootCauseAnalysis.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!analysis) {
      return res.status(404).json({ error: 'Root cause analysis not found' });
    }

    const aiResult = await openRouterService.analyzeRootCause({
      problem_name: analysis.problem_name,
      problem_description: analysis.problem_description,
      product_name: analysis.product?.name
    });

    await analysis.update({
      ai_analysis: aiResult.analysis,
      root_causes: aiResult.analysis?.five_whys_analysis,
      contributing_factors: aiResult.analysis?.contributing_factors,
      corrective_actions: aiResult.analysis?.corrective_actions,
      preventive_measures: aiResult.analysis?.preventive_measures
    });

    const updatedAnalysis = await RootCauseAnalysis.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });

    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Error running AI analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to run AI analysis' });
  }
});

module.exports = router;
