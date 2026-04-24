const express = require('express');
const { AIReport, Product } = require('../models');
const openRouterService = require('../services/openrouter');

const router = express.Router();

// Get all AI reports
router.get('/', async (req, res) => {
  try {
    const reports = await AIReport.findAll({
      include: [
        { model: Product, as: 'product', attributes: ['id', 'name', 'sku', 'category'] }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching AI reports:', error);
    res.status(500).json({ error: 'Failed to fetch AI reports' });
  }
});

// Get single AI report
router.get('/:id', async (req, res) => {
  try {
    const report = await AIReport.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!report) {
      return res.status(404).json({ error: 'AI report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error('Error fetching AI report:', error);
    res.status(500).json({ error: 'Failed to fetch AI report' });
  }
});

// Create new AI report (with AI analysis)
router.post('/', async (req, res) => {
  try {
    const {
      product_id,
      report_name,
      report_type,
      report_scope,
      include_data,
      run_ai
    } = req.body;

    let ai_analysis = null;
    let executive_summary = null;
    let sections = null;
    let recommendations = null;

    if (run_ai !== false) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.generateReport({
        report_name,
        report_type,
        report_scope,
        product_name: product?.name
      });
      ai_analysis = aiResult.analysis;
      executive_summary = ai_analysis?.executive_summary;
      sections = ai_analysis?.detailed_findings;
      recommendations = ai_analysis?.recommendations;
    }

    const report = await AIReport.create({
      product_id: product_id || null,
      report_name,
      report_type,
      report_scope,
      include_data,
      executive_summary,
      sections,
      recommendations,
      ai_analysis
    });

    const fullReport = await AIReport.findByPk(report.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.status(201).json(fullReport);
  } catch (error) {
    console.error('Error creating AI report:', error);
    res.status(500).json({ error: error.message || 'Failed to create AI report' });
  }
});

// Update AI report
router.put('/:id', async (req, res) => {
  try {
    const report = await AIReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'AI report not found' });
    }

    const {
      product_id,
      report_name,
      report_type,
      report_scope,
      include_data,
      rerun_ai
    } = req.body;

    let updateData = {
      product_id: product_id || null,
      report_name,
      report_type,
      report_scope,
      include_data
    };

    if (rerun_ai) {
      const product = product_id ? await Product.findByPk(product_id) : null;
      const aiResult = await openRouterService.generateReport({
        report_name: report_name || report.report_name,
        report_type: report_type || report.report_type,
        report_scope: report_scope || report.report_scope,
        product_name: product?.name
      });
      updateData.ai_analysis = aiResult.analysis;
      updateData.executive_summary = aiResult.analysis?.executive_summary;
      updateData.sections = aiResult.analysis?.detailed_findings;
      updateData.recommendations = aiResult.analysis?.recommendations;
    }

    await report.update(updateData);

    const updatedReport = await AIReport.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Error updating AI report:', error);
    res.status(500).json({ error: 'Failed to update AI report' });
  }
});

// Delete AI report
router.delete('/:id', async (req, res) => {
  try {
    const report = await AIReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'AI report not found' });
    }
    await report.destroy();
    res.json({ message: 'AI report deleted successfully' });
  } catch (error) {
    console.error('Error deleting AI report:', error);
    res.status(500).json({ error: 'Failed to delete AI report' });
  }
});

// Run AI analysis only
router.post('/:id/analyze', async (req, res) => {
  try {
    const report = await AIReport.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });
    if (!report) {
      return res.status(404).json({ error: 'AI report not found' });
    }

    const aiResult = await openRouterService.generateReport({
      report_name: report.report_name,
      report_type: report.report_type,
      report_scope: report.report_scope,
      product_name: report.product?.name
    });

    await report.update({
      ai_analysis: aiResult.analysis,
      executive_summary: aiResult.analysis?.executive_summary,
      sections: aiResult.analysis?.detailed_findings,
      recommendations: aiResult.analysis?.recommendations
    });

    const updatedReport = await AIReport.findByPk(req.params.id, {
      include: [{ model: Product, as: 'product' }]
    });

    res.json(updatedReport);
  } catch (error) {
    console.error('Error running AI analysis:', error);
    res.status(500).json({ error: error.message || 'Failed to run AI analysis' });
  }
});

module.exports = router;
