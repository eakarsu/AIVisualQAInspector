const express = require('express');
const { Inspection, Product, Defect } = require('../models');

const router = express.Router();

// Get all inspections
router.get('/', async (req, res) => {
  try {
    const inspections = await Inspection.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(inspections);
  } catch (error) {
    console.error('Error fetching inspections:', error);
    res.status(500).json({ error: 'Failed to fetch inspections' });
  }
});

// Get single inspection
router.get('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defects' }
      ]
    });
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }
    res.json(inspection);
  } catch (error) {
    console.error('Error fetching inspection:', error);
    res.status(500).json({ error: 'Failed to fetch inspection' });
  }
});

// Create inspection
router.post('/', async (req, res) => {
  try {
    const { product_id, inspector_name, status, notes, image_url, ai_analysis } = req.body;

    if (!product_id || !inspector_name) {
      return res.status(400).json({ error: 'Product ID and inspector name are required' });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const inspection = await Inspection.create({
      product_id,
      inspector_name,
      status: status || 'pending',
      notes,
      image_url,
      ai_analysis
    });

    const fullInspection = await Inspection.findByPk(inspection.id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }]
    });

    res.status(201).json(fullInspection);
  } catch (error) {
    console.error('Error creating inspection:', error);
    res.status(500).json({ error: 'Failed to create inspection' });
  }
});

// Update inspection
router.put('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    const { product_id, inspector_name, status, notes, image_url, ai_analysis } = req.body;

    if (product_id) {
      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
    }

    await inspection.update({
      product_id: product_id || inspection.product_id,
      inspector_name: inspector_name || inspection.inspector_name,
      status: status || inspection.status,
      notes: notes !== undefined ? notes : inspection.notes,
      image_url: image_url !== undefined ? image_url : inspection.image_url,
      ai_analysis: ai_analysis !== undefined ? ai_analysis : inspection.ai_analysis
    });

    const fullInspection = await Inspection.findByPk(inspection.id, {
      include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }]
    });

    res.json(fullInspection);
  } catch (error) {
    console.error('Error updating inspection:', error);
    res.status(500).json({ error: 'Failed to update inspection' });
  }
});

// Delete inspection
router.delete('/:id', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.id);
    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    await inspection.destroy();
    res.json({ success: true, message: 'Inspection deleted successfully' });
  } catch (error) {
    console.error('Error deleting inspection:', error);
    res.status(500).json({ error: 'Failed to delete inspection' });
  }
});

module.exports = router;
