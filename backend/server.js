require('dotenv').config({ path: '../.env' });
const express = require('express');
const cors = require('cors');
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

const app = express();
const PORT = process.env.BACKEND_PORT || 3001;

// Middleware
app.use(cors({
  origin: `http://localhost:${process.env.FRONTEND_PORT || 3000}`,
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
app.use('/api/products', productsRoutes);
app.use('/api/inspections', inspectionsRoutes);
app.use('/api/defects', defectsRoutes);
app.use('/api/ai', aiRoutes);
app.use('/api/reports', reportsRoutes);

// New AI Feature Routes
app.use('/api/defect-classifier', defectClassifierRoutes);
app.use('/api/severity-scorer', severityScorerRoutes);
app.use('/api/root-cause', rootCauseRoutes);
app.use('/api/trend-tracker', trendTrackerRoutes);
app.use('/api/quality-inspector', qualityInspectorRoutes);
app.use('/api/packaging-optimizer', packagingOptimizerRoutes);
app.use('/api/report-generator', reportGeneratorRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Stats endpoint for dashboard
app.get('/api/stats', async (req, res) => {
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

    app.listen(PORT, () => {
      console.log(`Backend server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();
