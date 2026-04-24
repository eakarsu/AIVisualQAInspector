const express = require('express');
const { Defect, Product, Inspection } = require('../models');

const router = express.Router();

// Get all defects
router.get('/', async (req, res) => {
  try {
    const defects = await Defect.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: Inspection, as: 'inspection', attributes: ['id', 'inspector_name', 'status'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(defects);
  } catch (error) {
    console.error('Error fetching defects:', error);
    res.status(500).json({ error: 'Failed to fetch defects' });
  }
});

// Get single defect
router.get('/:id', async (req, res) => {
  try {
    const defect = await Defect.findByPk(req.params.id, {
      include: [
        { model: Product, as: 'product' },
        { model: Inspection, as: 'inspection' }
      ]
    });
    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }
    res.json(defect);
  } catch (error) {
    console.error('Error fetching defect:', error);
    res.status(500).json({ error: 'Failed to fetch defect' });
  }
});

// Create defect
router.post('/', async (req, res) => {
  try {
    const { inspection_id, product_id, defect_type, severity, description, location, image_url, ai_analysis } = req.body;

    if (!product_id || !defect_type || !severity) {
      return res.status(400).json({ error: 'Product ID, defect type, and severity are required' });
    }

    const product = await Product.findByPk(product_id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }

    if (inspection_id) {
      const inspection = await Inspection.findByPk(inspection_id);
      if (!inspection) {
        return res.status(404).json({ error: 'Inspection not found' });
      }
    }

    const defect = await Defect.create({
      inspection_id,
      product_id,
      defect_type,
      severity,
      description,
      location,
      image_url,
      ai_analysis
    });

    const fullDefect = await Defect.findByPk(defect.id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: Inspection, as: 'inspection', attributes: ['id', 'inspector_name', 'status'] }
      ]
    });

    res.status(201).json(fullDefect);
  } catch (error) {
    console.error('Error creating defect:', error);
    res.status(500).json({ error: 'Failed to create defect' });
  }
});

// Update defect
router.put('/:id', async (req, res) => {
  try {
    const defect = await Defect.findByPk(req.params.id);
    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    const { inspection_id, product_id, defect_type, severity, description, location, image_url, ai_analysis } = req.body;

    if (product_id) {
      const product = await Product.findByPk(product_id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
    }

    if (inspection_id) {
      const inspection = await Inspection.findByPk(inspection_id);
      if (!inspection) {
        return res.status(404).json({ error: 'Inspection not found' });
      }
    }

    await defect.update({
      inspection_id: inspection_id !== undefined ? inspection_id : defect.inspection_id,
      product_id: product_id || defect.product_id,
      defect_type: defect_type || defect.defect_type,
      severity: severity || defect.severity,
      description: description !== undefined ? description : defect.description,
      location: location !== undefined ? location : defect.location,
      image_url: image_url !== undefined ? image_url : defect.image_url,
      ai_analysis: ai_analysis !== undefined ? ai_analysis : defect.ai_analysis
    });

    const fullDefect = await Defect.findByPk(defect.id, {
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] },
        { model: Inspection, as: 'inspection', attributes: ['id', 'inspector_name', 'status'] }
      ]
    });

    res.json(fullDefect);
  } catch (error) {
    console.error('Error updating defect:', error);
    res.status(500).json({ error: 'Failed to update defect' });
  }
});

// Delete defect
router.delete('/:id', async (req, res) => {
  try {
    const defect = await Defect.findByPk(req.params.id);
    if (!defect) {
      return res.status(404).json({ error: 'Defect not found' });
    }

    await defect.destroy();
    res.json({ success: true, message: 'Defect deleted successfully' });
  } catch (error) {
    console.error('Error deleting defect:', error);
    res.status(500).json({ error: 'Failed to delete defect' });
  }
});

// Get defects by severity
router.get('/severity/:severity', async (req, res) => {
  try {
    const defects = await Defect.findAll({
      where: { severity: req.params.severity },
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(defects);
  } catch (error) {
    console.error('Error fetching defects by severity:', error);
    res.status(500).json({ error: 'Failed to fetch defects' });
  }
});

module.exports = router;
