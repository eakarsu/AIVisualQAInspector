const express = require('express');
const { TrendAnalysis, Product } = require('../models');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Get all trend analyses
router.get('/', async (req, res) => {
  try {
    const analyses = await TrendAnalysis.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'category'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(analyses);
  } catch (error) {
    console.error('Error fetching trend analyses:', error);
    res.status(500).json({ error: 'Failed to fetch trend analyses' });
  }
});

// Get single analysis
router.get('/:id', async (req, res) => {
  try {
    const analysis = await TrendAnalysis.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!analysis) {
      return res.status(404).json({ error: 'Trend analysis not found' });
    }
    res.json(analysis);
  } catch (error) {
    console.error('Error fetching trend analysis:', error);
    res.status(500).json({ error: 'Failed to fetch trend analysis' });
  }
});

// Create new trend analysis (with AI analysis)
router.post('/', async (req, res) => {
  try {
    const { product_id, trend_name, analysis_period, trend_type, data_points, run_ai } = req.body;

    let ai_analysis = null;
    let metrics = null;
    let patterns = null;
    let predictions = null;

    if (run_ai !== false) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.analyzeTrends({
        trend_name,
        analysis_period,
        trend_type,
        data_points,
        product_name: product?.name
      });
      ai_analysis = aiResult.analysis;
      metrics = ai_analysis?.statistical_analysis;
      patterns = ai_analysis?.patterns_identified;
      predictions = ai_analysis?.predictions;
    }

    const analysis = await TrendAnalysis.create({
      product_id: product_id || null,
      trend_name,
      analysis_period,
      trend_type,
      data_points,
      metrics,
      patterns,
      predictions,
      ai_analysis
    });

    const fullAnalysis = await TrendAnalysis.findByPk(analysis.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.status(201).json(fullAnalysis);
  } catch (error) {
    console.error('Error creating trend analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to create trend analysis' });
  }
});

// Update trend analysis
router.put('/:id', async (req, res) => {
  try {
    const analysis = await TrendAnalysis.findByPk(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Trend analysis not found' });
    }

    const { product_id, trend_name, analysis_period, trend_type, data_points, rerun_ai } = req.body;

    let updateData = { product_id: product_id || null, trend_name, analysis_period, trend_type, data_points };

    if (rerun_ai) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.analyzeTrends({
        trend_name: trend_name || analysis.trend_name,
        analysis_period: analysis_period || analysis.analysis_period,
        trend_type: trend_type || analysis.trend_type,
        data_points: data_points || analysis.data_points,
        product_name: product?.name
      });
      updateData.ai_analysis = aiResult.analysis;
      updateData.metrics = aiResult.analysis?.statistical_analysis;
      updateData.patterns = aiResult.analysis?.patterns_identified;
      updateData.predictions = aiResult.analysis?.predictions;
    }

    await analysis.update(updateData);

    const updatedAnalysis = await TrendAnalysis.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Error updating trend analysis:', error);
    res.status(500).json({ error: 'Failed to update trend analysis' });
  }
});

// Delete trend analysis
router.delete('/:id', async (req, res) => {
  try {
    const analysis = await TrendAnalysis.findByPk(req.params.id);
    if (!analysis) {
      return res.status(404).json({ error: 'Trend analysis not found' });
    }
    await analysis.destroy();
    res.json({ message: 'Trend analysis deleted successfully' });
  } catch (error) {
    console.error('Error deleting trend analysis:', error);
    res.status(500).json({ error: 'Failed to delete trend analysis' });
  }
});

// Run AI analysis only
router.post('/:id/analyze', async (req, res) => {
  try {
    const analysis = await TrendAnalysis.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!analysis) {
      return res.status(404).json({ error: 'Trend analysis not found' });
    }

    const aiResult = await openRouterService.analyzeTrends({
      trend_name: analysis.trend_name,
      analysis_period: analysis.analysis_period,
      trend_type: analysis.trend_type,
      data_points: analysis.data_points,
      product_name: analysis.product?.name
    });

    await analysis.update({
      ai_analysis: aiResult.analysis,
      metrics: aiResult.analysis?.statistical_analysis,
      patterns: aiResult.analysis?.patterns_identified,
      predictions: aiResult.analysis?.predictions
    });

    const updatedAnalysis = await TrendAnalysis.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.json(updatedAnalysis);
  } catch (error) {
    console.error('Error running AI analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to run AI analysis' });
  }
});

module.exports = router;
