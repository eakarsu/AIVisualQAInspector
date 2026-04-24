const express = require('express');
const { DefectClassification, Product, Defect } = require('../models');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Get all classifications
router.get('/', async (req, res) => {
  try {
    const classifications = await DefectClassification.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'category'] },
        { model: Defect, as: 'defect', attributes: ['id', 'defect_type', 'severity'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(classifications);
  } catch (error) {
    console.error('Error fetching classifications:', error);
    res.status(500).json({ error: 'Failed to fetch classifications' });
  }
});

// Get single classification
router.get('/:id', async (req, res) => {
  try {
    const classification = await DefectClassification.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });
    if (!classification) {
      return res.status(404).json({ error: 'Classification not found' });
    }
    res.json(classification);
  } catch (error) {
    console.error('Error fetching classification:', error);
    res.status(500).json({ error: 'Failed to fetch classification' });
  }
});

// Create new classification (with AI analysis)
router.post('/', async (req, res) => {
  try {
    const { defect_id, product_id, defect_name, defect_description, category, sub_category, run_ai } = req.body;

    let ai_analysis = null;
    let confidence_score = null;

    if (run_ai !== false) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.classifyDefect({
        defect_name,
        defect_description,
        product_name: product?.name
      });
      ai_analysis = aiResult.analysis;
      confidence_score = ai_analysis?.confidence_score || ai_analysis?.classification?.confidence_score || 85;
    }

    const classification = await DefectClassification.create({
      defect_id: defect_id || null,
      product_id: product_id || null,
      defect_name,
      defect_description,
      category: ai_analysis?.classification?.primary_category || category,
      sub_category: ai_analysis?.classification?.sub_category || sub_category,
      confidence_score,
      ai_analysis
    });

    const fullClassification = await DefectClassification.findByPk(classification.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });

    res.status(201).json(fullClassification);
  } catch (error) {
    console.error('Error creating classification:', error);
    res.status(500).json({ error: error.message || 'Failed to create classification' });
  }
});

// Update classification
router.put('/:id', async (req, res) => {
  try {
    const classification = await DefectClassification.findByPk(req.params.id);
    if (!classification) {
      return res.status(404).json({ error: 'Classification not found' });
    }

    const { defect_id, product_id, defect_name, defect_description, category, sub_category, rerun_ai } = req.body;

    let updateData = { defect_id: defect_id || null, product_id: product_id || null, defect_name, defect_description, category, sub_category };

    if (rerun_ai) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.classifyDefect({
        defect_name: defect_name || classification.defect_name,
        defect_description: defect_description || classification.defect_description,
        product_name: product?.name
      });
      updateData.ai_analysis = aiResult.analysis;
      updateData.confidence_score = aiResult.analysis?.confidence_score || 85;
      updateData.category = aiResult.analysis?.classification?.primary_category || category;
      updateData.sub_category = aiResult.analysis?.classification?.sub_category || sub_category;
    }

    await classification.update(updateData);

    const updatedClassification = await DefectClassification.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });

    res.json(updatedClassification);
  } catch (error) {
    console.error('Error updating classification:', error);
    res.status(500).json({ error: 'Failed to update classification' });
  }
});

// Delete classification
router.delete('/:id', async (req, res) => {
  try {
    const classification = await DefectClassification.findByPk(req.params.id);
    if (!classification) {
      return res.status(404).json({ error: 'Classification not found' });
    }
    await classification.destroy();
    res.json({ message: 'Classification deleted successfully' });
  } catch (error) {
    console.error('Error deleting classification:', error);
    res.status(500).json({ error: 'Failed to delete classification' });
  }
});

// Run AI classification only
router.post('/:id/analyze', async (req, res) => {
  try {
    const classification = await DefectClassification.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!classification) {
      return res.status(404).json({ error: 'Classification not found' });
    }

    const aiResult = await openRouterService.classifyDefect({
      defect_name: classification.defect_name,
      defect_description: classification.defect_description,
      product_name: classification.product?.name
    });

    await classification.update({
      ai_analysis: aiResult.analysis,
      confidence_score: aiResult.analysis?.confidence_score || 85,
      category: aiResult.analysis?.classification?.primary_category || classification.category,
      sub_category: aiResult.analysis?.classification?.sub_category || classification.sub_category
    });

    const updatedClassification = await DefectClassification.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defect' }
      ]
    });

    res.json(updatedClassification);
  } catch (error) {
    console.error('Error running AI analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to run AI analysis' });
  }
});

module.exports = router;
