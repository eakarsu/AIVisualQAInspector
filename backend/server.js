require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');

const { sequelize } = require('./models');

// Import routes
const authRoutes = require('./routes/auth');
const productsRoutes = require('./routes/products');
const inspectionsRoutes = require('./routes/inspections');
const defectsRoutes = require('./routes/defects');
const aiRoutes = require('./routes/ai');
const reportsRoutes = require('./routes/reports');

// Import new AI feature routes
const defectClassifierRoutes = require('./routes/defect-classifier');
const severityScorerRoutes = require('./routes/severity-scorer');
const rootCauseRoutes = require('./routes/root-cause');
const trendTrackerRoutes = require('./routes/trend-tracker');
const qualityInspectorRoutes = require('./routes/quality-inspector');
const packagingOptimizerRoutes = require('./routes/packaging-optimizer');
const reportGeneratorRoutes = require('./routes/report-generator');

// Import new proposed feature routes
const batchInspectionRoutes = require('./routes/batch-inspection');
const defectTrendAnalyticsRoutes = require('./routes/defect-trend-analytics');
const reinspectionSchedulerRoutes = require('./routes/reinspection-scheduler');
const mesAlertsRoutes = require('./routes/mes-alerts');

// Auth middleware
const auth = require('./middleware/auth');
const { aiRateLimiter } = require('./middleware/rateLimiter');

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || `http://localhost:${process.env.FRONTEND_PORT || 3000}`,
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Session configuration
app.use(session({
  secret: process.env.JWT_SECRET || 'visual-qa-inspector-secret-key',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: false,
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
  }
}));

// Static files for uploads
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', auth, productsRoutes);
app.use('/api/inspections', auth, inspectionsRoutes);
app.use('/api/defects', auth, defectsRoutes);
app.use('/api/ai', auth, aiRateLimiter, aiRoutes);
app.use('/api/reports', auth, reportsRoutes);

// New AI Feature Routes (auth + rate limiting on each)
app.use('/api/defect-classifier', auth, aiRateLimiter, defectClassifierRoutes);
app.use('/api/severity-scorer', auth, aiRateLimiter, severityScorerRoutes);
app.use('/api/root-cause', auth, aiRateLimiter, rootCauseRoutes);
app.use('/api/trend-tracker', auth, aiRateLimiter, trendTrackerRoutes);
app.use('/api/quality-inspector', auth, aiRateLimiter, qualityInspectorRoutes);
app.use('/api/packaging-optimizer', auth, aiRateLimiter, packagingOptimizerRoutes);
app.use('/api/report-generator', auth, aiRateLimiter, reportGeneratorRoutes);

// New proposed feature routes
app.use('/api/batch-inspection', auth, aiRateLimiter, batchInspectionRoutes);
app.use('/api/defect-trend-analytics', auth, defectTrendAnalyticsRoutes);
app.use('/api/reinspection-scheduler', auth, reinspectionSchedulerRoutes);
app.use('/api/mes-alerts', auth, mesAlertsRoutes);

// Custom Views (no auth — read-only chart/report endpoints + rules CRUD) - MUST be before any 404 handler
app.use('/api/custom-views', require('./routes/customViews'));

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stats endpoint for dashboard
app.get('/api/stats', auth, async (req, res) => {
  try {
    const { Product, Inspection, Defect, InspectionReport, DefectClassification, SeverityScore, RootCauseAnalysis, TrendAnalysis, QualityInspection, PackagingOptimization, AIReport } = require('./models');

    const [
      products,
      inspections,
      defects,
      reports,
      classifications,
      severityScores,
      rootCauses,
      trends,
      qualityInspections,
      packagingOptimizations,
      aiReports
    ] = await Promise.all([
      Product.count(),
      Inspection.count(),
      Defect.count(),
      InspectionReport.count(),
      DefectClassification.count(),
      SeverityScore.count(),
      RootCauseAnalysis.count(),
      TrendAnalysis.count(),
      QualityInspection.count(),
      PackagingOptimization.count(),
      AIReport.count()
    ]);

    res.json({
      products,
      inspections,
      defects,
      reports,
      classifications,
      severityScores,
      rootCauses,
      trends,
      qualityInspections,
      packagingOptimizations,
      aiReports
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: err.message || 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.stack : undefined
  });
});

// Start server
const startServer = async () => {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established');

    // Sync models (don't force in production)
    await sequelize.sync({ alter: true });
    console.log('Database models synced');

    app.use('/api/cv-defect-detector', require('./routes/cvDefectDetector')); app.use('/api/predictive-quality-scoring', require('./routes/predictiveQualityScoring')); app.use('/api/root-cause-correlation', require('./routes/rootCauseCorrelation')); app.use('/api/supplier-quality-tracking', require('./routes/supplierQualityTracking')); app.use('/api/process-change-recommender', require('./routes/processChangeRecommender')); app.use('/api/mes-erp-integration', require('./routes/mesErpIntegration'));

// === Batch 08 Gaps & Frontend Mounts ===
app.use('/api/gap-no-computer-vision-for-direct-defect-detection-from', require('./routes/gapNoComputerVisionForDirectDefectDetectionFrom'));
app.use('/api/gap-no-predictive-quality-scoring-for-upcoming-production-runs', require('./routes/gapNoPredictiveQualityScoringForUpcomingProductionRuns'));
app.use('/api/gap-no-automated-root-cause-correlation-ml', require('./routes/gapNoAutomatedRootCauseCorrelationMl'));
app.use('/api/gap-limited-integration-with-production-line-cameras-only-generic-integrations', require('./routes/gapLimitedIntegrationWithProductionLineCamerasOnlyGenericIntegrations'));
app.use('/api/gap-no-real-time-spc-statistical-process-control-visualization', require('./routes/gapNoRealTimeSpcStatisticalProcessControlVisualization'));
app.use('/api/gap-no-erp-integration-for-rework-scrap-tracking', require('./routes/gapNoErpIntegrationForReworkScrapTracking'));
app.use('/api/gap-no-supplier-quality-management-module', require('./routes/gapNoSupplierQualityManagementModule'));
app.use('/api/gap-no-webhooks-for-mes-events-beyond-the-alert', require('./routes/gapNoWebhooksForMesEventsBeyondTheAlert'));
app.use('/api/gap-no-notifications-subsystem', require('./routes/gapNoNotificationsSubsystem'));

app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
