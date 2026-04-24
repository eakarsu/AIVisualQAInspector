const express = require('express');
const { InspectionReport, Inspection, Product, Defect } = require('../models');

const router = express.Router();

// Get all reports
router.get('/', async (req, res) => {
  try {
    const reports = await InspectionReport.findAll({
      include: [
        {
          model: Inspection,
          as: 'inspection',
          include: [
            { model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }
          ]
        }
      ],
      order: [['created_at', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get single report
router.get('/:id', async (req, res) => {
  try {
    const report = await InspectionReport.findByPk(req.params.id, {
      include: [
        {
          model: Inspection,
          as: 'inspection',
          include: [
            { model: Product, as: 'product' },
            { model: Defect, as: 'defects' }
          ]
        }
      ]
    });
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }
    res.json(report);
  } catch (error) {
    console.error('Error fetching report:', error);
    res.status(500).json({ error: 'Failed to fetch report' });
  }
});

// Generate report for an inspection
router.post('/generate/:inspectionId', async (req, res) => {
  try {
    const inspection = await Inspection.findByPk(req.params.inspectionId, {
      include: [
        { model: Product, as: 'product' },
        { model: Defect, as: 'defects' }
      ]
    });

    if (!inspection) {
      return res.status(404).json({ error: 'Inspection not found' });
    }

    // Generate report data
    const defectsBySeverity = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    if (inspection.defects) {
      inspection.defects.forEach(defect => {
        if (defectsBySeverity[defect.severity] !== undefined) {
          defectsBySeverity[defect.severity]++;
        }
      });
    }

    const reportData = {
      inspection_id: inspection.id,
      product: {
        id: inspection.product?.id,
        name: inspection.product?.name,
        sku: inspection.product?.sku,
        category: inspection.product?.category
      },
      inspector: inspection.inspector_name,
      inspection_date: inspection.created_at,
      status: inspection.status,
      notes: inspection.notes,
      ai_analysis: inspection.ai_analysis,
      defects_summary: {
        total: inspection.defects?.length || 0,
        by_severity: defectsBySeverity
      },
      defects: inspection.defects?.map(d => ({
        id: d.id,
        type: d.defect_type,
        severity: d.severity,
        location: d.location,
        description: d.description
      })) || [],
      generated_at: new Date().toISOString(),
      quality_score: calculateQualityScore(inspection.defects || [])
    };

    const report = await InspectionReport.create({
      inspection_id: inspection.id,
      report_data: reportData
    });

    const fullReport = await InspectionReport.findByPk(report.id, {
      include: [
        {
          model: Inspection,
          as: 'inspection',
          include: [{ model: Product, as: 'product', attributes: ['id', 'name', 'sku'] }]
        }
      ]
    });

    res.status(201).json(fullReport);
  } catch (error) {
    console.error('Error generating report:', error);
    res.status(500).json({ error: 'Failed to generate report' });
  }
});

// Delete report
router.delete('/:id', async (req, res) => {
  try {
    const report = await InspectionReport.findByPk(req.params.id);
    if (!report) {
      return res.status(404).json({ error: 'Report not found' });
    }

    await report.destroy();
    res.json({ success: true, message: 'Report deleted successfully' });
  } catch (error) {
    console.error('Error deleting report:', error);
    res.status(500).json({ error: 'Failed to delete report' });
  }
});

// Get reports for a specific inspection
router.get('/inspection/:inspectionId', async (req, res) => {
  try {
    const reports = await InspectionReport.findAll({
      where: { inspection_id: req.params.inspectionId },
      order: [['created_at', 'DESC']]
    });
    res.json(reports);
  } catch (error) {
    console.error('Error fetching reports:', error);
    res.status(500).json({ error: 'Failed to fetch reports' });
  }
});

// Get summary statistics
router.get('/stats/summary', async (req, res) => {
  try {
    const [inspections, defects, products, reports] = await Promise.all([
      Inspection.findAll(),
      Defect.findAll(),
      Product.count(),
      InspectionReport.count()
    ]);

    const statusCounts = {
      pending: 0,
      in_progress: 0,
      completed: 0,
      failed: 0
    };

    inspections.forEach(i => {
      if (statusCounts[i.status] !== undefined) {
        statusCounts[i.status]++;
      }
    });

    const severityCounts = {
      critical: 0,
      high: 0,
      medium: 0,
      low: 0
    };

    defects.forEach(d => {
      if (severityCounts[d.severity] !== undefined) {
        severityCounts[d.severity]++;
      }
    });

    res.json({
      total_products: products,
      total_inspections: inspections.length,
      total_defects: defects.length,
      total_reports: reports,
      inspections_by_status: statusCounts,
      defects_by_severity: severityCounts,
      pass_rate: inspections.length > 0
        ? Math.round((statusCounts.completed / inspections.length) * 100)
        : 0
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
});

// Helper function to calculate quality score
function calculateQualityScore(defects) {
  if (!defects || defects.length === 0) return 100;

  const severityWeights = {
    critical: 25,
    high: 15,
    medium: 8,
    low: 3
  };

  let deductions = 0;
  defects.forEach(defect => {
    deductions += severityWeights[defect.severity] || 5;
  });

  return Math.max(0, 100 - deductions);
}

module.exports = router;
