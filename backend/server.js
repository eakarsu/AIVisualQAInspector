'use strict';
require('dotenv').config({ path: require('path').resolve(__dirname, '../.env') });
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const session = require('express-session');
const path = require('path');
const { sequelize } = require('./models');
const auth = require('./middleware/auth');
const governanceRouter = require('./governance');

for (const name of ['DATABASE_URL', 'GOVERNANCE_TENANT_ID']) {
  if (!process.env[name]) throw new Error(`${name} is required`);
}
if (!process.env.JWT_SECRET || process.env.JWT_SECRET.length < 32) {
  throw new Error('JWT_SECRET must be at least 32 characters');
}

const app = express();
const PORT = process.env.PORT || process.env.BACKEND_PORT || 3001;
const generatedRoutesEnabled = process.env.ENABLE_GENERATED_FEATURES === 'true' && process.env.NODE_ENV !== 'production';

app.use(helmet());
app.use(cors({
  origin: process.env.CLIENT_URL || `http://localhost:${process.env.FRONTEND_PORT || 3000}`,
  credentials: true
}));
app.use(express.json({ limit: '2mb' }));
app.use(express.urlencoded({ extended: true }));
app.use(session({
  secret: process.env.JWT_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    sameSite: 'lax',
    maxAge: 8 * 60 * 60 * 1000
  }
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));
app.use('/api/auth', require('./routes/auth'));
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', generatedRoutesEnabled, timestamp: new Date().toISOString() });
});

app.use('/api', auth);
app.use('/api/governance', governanceRouter);
app.use('/api/runtime-ai', require('./routes/runtimeAi'));
app.use('/api/products', require('./routes/products'));
app.use('/api/inspections', require('./routes/inspections'));
app.use('/api/defects', require('./routes/defects'));
app.use('/api/reports', require('./routes/reports'));

const customViewsRoutes = require('./routes/customViews');
app.use('/api/custom-views', customViewsRoutes);

app.get('/api/stats', async (req, res, next) => {
  try {
    const { Product, Inspection, Defect, InspectionReport } = require('./models');
    const [products, inspections, defects, reports] = await Promise.all([
      Product.count(), Inspection.count(), Defect.count(), InspectionReport.count()
    ]);
    res.json({ products, inspections, defects, reports });
  } catch (error) { next(error); }
});

if (generatedRoutesEnabled) {
  const { aiRateLimiter } = require('./middleware/rateLimiter');
  const mounts = [
    ['/api/ai', './routes/ai'],
    ['/api/defect-classifier', './routes/defect-classifier'],
    ['/api/severity-scorer', './routes/severity-scorer'],
    ['/api/root-cause', './routes/root-cause'],
    ['/api/trend-tracker', './routes/trend-tracker'],
    ['/api/quality-inspector', './routes/quality-inspector'],
    ['/api/packaging-optimizer', './routes/packaging-optimizer'],
    ['/api/report-generator', './routes/report-generator'],
    ['/api/batch-inspection', './routes/batch-inspection'],
    ['/api/defect-trend-analytics', './routes/defect-trend-analytics'],
    ['/api/reinspection-scheduler', './routes/reinspection-scheduler'],
    ['/api/mes-alerts', './routes/mes-alerts'],
    ['/api/cv-defect-detector', './routes/cvDefectDetector'],
    ['/api/predictive-quality-scoring', './routes/predictiveQualityScoring'],
    ['/api/root-cause-correlation', './routes/rootCauseCorrelation'],
    ['/api/supplier-quality-tracking', './routes/supplierQualityTracking'],
    ['/api/process-change-recommender', './routes/processChangeRecommender'],
    ['/api/mes-erp-integration', './routes/mesErpIntegration']
  ];
  mounts.forEach(([mount, modulePath]) => app.use(mount, aiRateLimiter, require(modulePath)));
}

app.use((req, res) => res.status(404).json({ error: 'not found' }));
app.use((err, req, res, next) => {
  console.error('Unhandled request error:', err.message);
  res.status(500).json({ error: 'internal server error' });
});

async function startServer() {
  await sequelize.authenticate();
  // No sync/alter here: schema changes require an explicit reviewed migration.
  app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
}

startServer().catch((error) => {
  console.error('Failed to start server:', error.message);
  process.exit(1);
});
