const express = require('express');
const { PackagingOptimization, Product } = require('../models');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Get all packaging optimizations
router.get('/', async (req, res) => {
  try {
    const optimizations = await PackagingOptimization.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'category'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(optimizations);
  } catch (error) {
    console.error('Error fetching packaging optimizations:', error);
    res.status(500).json({ error: 'Failed to fetch packaging optimizations' });
  }
});

// Get single optimization
router.get('/:id', async (req, res) => {
  try {
    const optimization = await PackagingOptimization.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!optimization) {
      return res.status(404).json({ error: 'Packaging optimization not found' });
    }
    res.json(optimization);
  } catch (error) {
    console.error('Error fetching packaging optimization:', error);
    res.status(500).json({ error: 'Failed to fetch packaging optimization' });
  }
});

// Create new packaging optimization (with AI analysis)
router.post('/', async (req, res) => {
  try {
    const {
      product_id,
      optimization_name,
      current_packaging,
      product_dimensions,
      product_weight,
      fragility_level,
      shipping_requirements,
      optimization_goals,
      run_ai
    } = req.body;

    let ai_analysis = null;
    let recommended_packaging = null;
    let cost_analysis = null;
    let environmental_impact = null;

    if (run_ai !== false) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.optimizePackaging({
        optimization_name,
        product_name: product?.name,
        current_packaging,
        product_dimensions,
        product_weight,
        fragility_level,
        shipping_requirements,
        optimization_goals
      });
      ai_analysis = aiResult.analysis;
      recommended_packaging = ai_analysis?.recommended_packaging;
      cost_analysis = ai_analysis?.cost_analysis;
      environmental_impact = ai_analysis?.environmental_impact;
    }

    const optimization = await PackagingOptimization.create({
      product_id: product_id || null,
      optimization_name,
      current_packaging,
      product_dimensions,
      product_weight,
      fragility_level,
      shipping_requirements,
      optimization_goals,
      recommended_packaging,
      cost_analysis,
      environmental_impact,
      ai_analysis
    });

    const fullOptimization = await PackagingOptimization.findByPk(optimization.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.status(201).json(fullOptimization);
  } catch (error) {
    console.error('Error creating packaging optimization:', error);
    res.status(500).json({ error: error.message || 'Failed to create packaging optimization' });
  }
});

// Update packaging optimization
router.put('/:id', async (req, res) => {
  try {
    const optimization = await PackagingOptimization.findByPk(req.params.id);
    if (!optimization) {
      return res.status(404).json({ error: 'Packaging optimization not found' });
    }

    const {
      product_id,
      optimization_name,
      current_packaging,
      product_dimensions,
      product_weight,
      fragility_level,
      shipping_requirements,
      optimization_goals,
      rerun_ai
    } = req.body;

    let updateData = {
      product_id: product_id || null,
      optimization_name,
      current_packaging,
      product_dimensions,
      product_weight,
      fragility_level,
      shipping_requirements,
      optimization_goals
    };

    if (rerun_ai) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.optimizePackaging({
        optimization_name: optimization_name || optimization.optimization_name,
        product_name: product?.name,
        current_packaging: current_packaging || optimization.current_packaging,
        product_dimensions: product_dimensions || optimization.product_dimensions,
        product_weight: product_weight || optimization.product_weight,
        fragility_level: fragility_level || optimization.fragility_level,
        shipping_requirements: shipping_requirements || optimization.shipping_requirements,
        optimization_goals: optimization_goals || optimization.optimization_goals
      });
      updateData.ai_analysis = aiResult.analysis;
      updateData.recommended_packaging = aiResult.analysis?.recommended_packaging;
      updateData.cost_analysis = aiResult.analysis?.cost_analysis;
      updateData.environmental_impact = aiResult.analysis?.environmental_impact;
    }

    await optimization.update(updateData);

    const updatedOptimization = await PackagingOptimization.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.json(updatedOptimization);
  } catch (error) {
    console.error('Error updating packaging optimization:', error);
    res.status(500).json({ error: 'Failed to update packaging optimization' });
  }
});

// Delete packaging optimization
router.delete('/:id', async (req, res) => {
  try {
    const optimization = await PackagingOptimization.findByPk(req.params.id);
    if (!optimization) {
      return res.status(404).json({ error: 'Packaging optimization not found' });
    }
    await optimization.destroy();
    res.json({ message: 'Packaging optimization deleted successfully' });
  } catch (error) {
    console.error('Error deleting packaging optimization:', error);
    res.status(500).json({ error: 'Failed to delete packaging optimization' });
  }
});

// Run AI analysis only
router.post('/:id/analyze', async (req, res) => {
  try {
    const optimization = await PackagingOptimization.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!optimization) {
      return res.status(404).json({ error: 'Packaging optimization not found' });
    }

    const aiResult = await openRouterService.optimizePackaging({
      optimization_name: optimization.optimization_name,
      product_name: optimization.product?.name,
      current_packaging: optimization.current_packaging,
      product_dimensions: optimization.product_dimensions,
      product_weight: optimization.product_weight,
      fragility_level: optimization.fragility_level,
      shipping_requirements: optimization.shipping_requirements,
      optimization_goals: optimization.optimization_goals
    });

    await optimization.update({
      ai_analysis: aiResult.analysis,
      recommended_packaging: aiResult.analysis?.recommended_packaging,
      cost_analysis: aiResult.analysis?.cost_analysis,
      environmental_impact: aiResult.analysis?.environmental_impact
    });

    const updatedOptimization = await PackagingOptimization.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.json(updatedOptimization);
  } catch (error) {
    console.error('Error running AI analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to run AI analysis' });
  }
});

module.exports = router;
