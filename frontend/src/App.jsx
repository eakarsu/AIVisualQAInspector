import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import ProductList from './components/Products/ProductList';
import ProductDetail from './components/Products/ProductDetail';
import InspectionList from './components/Inspections/InspectionList';
import InspectionDetail from './components/Inspections/InspectionDetail';
import DefectList from './components/Defects/DefectList';
import DefectDetail from './components/Defects/DefectDetail';
import AIAnalysis from './components/AIAnalysis/ImageUpload';
import ReportList from './components/Reports/ReportList';
import ReportDetail from './components/Reports/ReportDetail';
import Sidebar from './components/common/Sidebar';

// AI Feature Components
import DefectClassifierList from './components/DefectClassifier/DefectClassifierList';
import DefectClassifierDetail from './components/DefectClassifier/DefectClassifierDetail';
import SeverityScorerList from './components/SeverityScorer/SeverityScorerList';
import SeverityScorerDetail from './components/SeverityScorer/SeverityScorerDetail';
import RootCauseList from './components/RootCause/RootCauseList';
import RootCauseDetail from './components/RootCause/RootCauseDetail';
import TrendTrackerList from './components/TrendTracker/TrendTrackerList';
import TrendTrackerDetail from './components/TrendTracker/TrendTrackerDetail';
import QualityInspectorList from './components/QualityInspector/QualityInspectorList';
import QualityInspectorDetail from './components/QualityInspector/QualityInspectorDetail';
import PackagingOptimizerList from './components/PackagingOptimizer/PackagingOptimizerList';
import PackagingOptimizerDetail from './components/PackagingOptimizer/PackagingOptimizerDetail';
import AIReportGeneratorList from './components/AIReportGenerator/AIReportGeneratorList';
import AIReportGeneratorDetail from './components/AIReportGenerator/AIReportGeneratorDetail';

// Proposed New Feature Components
import BatchInspectionList from './components/BatchInspection/BatchInspectionList';
import BatchInspectionDetail from './components/BatchInspection/BatchInspectionDetail';
import DefectTrendAnalyticsDashboard from './components/DefectTrendAnalytics/DefectTrendAnalyticsDashboard';
import ReinspectionSchedulerList from './components/ReinspectionScheduler/ReinspectionSchedulerList';
import MESAlertsList from './components/MESAlerts/MESAlertsList';
import PredictiveQualityPage from './components/PredictiveQuality/PredictiveQualityPage';
import ImprovementRecommendationsPage from './components/ImprovementRecommendations/ImprovementRecommendationsPage';
import SupplierQualityScorePage from './components/SupplierQualityScore/SupplierQualityScorePage';
import DefectParameterCorrelationPage from './components/DefectParameterCorrelation/DefectParameterCorrelationPage';
import SPCControlChartPage from './components/SPCControlChart/SPCControlChartPage';
// === Batch 08 Gaps & Frontend Mounts ===
import CfComputerVisionDefectDetectorRunningOnLine from './pages/CfComputerVisionDefectDetectorRunningOnLine'
import CfPredictiveQualityScoringFlaggingAtRiskProduction from './pages/CfPredictiveQualityScoringFlaggingAtRiskProduction'
import CfRootCauseCorrelationTyingDefectsToProcess from './pages/CfRootCauseCorrelationTyingDefectsToProcess'
import CfSupplierQualityTrackingScoringSupplierDefectContributions from './pages/CfSupplierQualityTrackingScoringSupplierDefectContributions'
import CfProcessChangeRecommendationEngineReducingDefectRates from './pages/CfProcessChangeRecommendationEngineReducingDefectRates'
import CfDirectMesErpIntegrationForClosedLoop from './pages/CfDirectMesErpIntegrationForClosedLoop'
import GapNoComputerVisionForDirectDefectDetection from './pages/GapNoComputerVisionForDirectDefectDetection'
import GapNoPredictiveQualityScoringForUpcomingProduction from './pages/GapNoPredictiveQualityScoringForUpcomingProduction'
import GapNoAutomatedRootCauseCorrelationMl from './pages/GapNoAutomatedRootCauseCorrelationMl'
import GapLimitedIntegrationWithProductionLineCamerasOnly from './pages/GapLimitedIntegrationWithProductionLineCamerasOnly'
import GapNoRealTimeSpcStatisticalProcessControl from './pages/GapNoRealTimeSpcStatisticalProcessControl'
import GapNoErpIntegrationForReworkScrapTracking from './pages/GapNoErpIntegrationForReworkScrapTracking'
import GapNoSupplierQualityManagementModule from './pages/GapNoSupplierQualityManagementModule'
import GapNoWebhooksForMesEventsBeyondThe from './pages/GapNoWebhooksForMesEventsBeyondThe'
import GapNoNotificationsSubsystem from './pages/GapNoNotificationsSubsystem'

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    if (storedUser && token) {
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const handleLogin = (userData, token) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
    localStorage.setItem('token', token);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  if (loading) {
    return (
      <div className="loading-spinner" style={{ minHeight: '100vh' }}>
        <div className="spinner"></div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app-container">
        {user && <Sidebar user={user} onLogout={handleLogout} />}
        <Routes>
          <Route
            path="/login"
            element={user ? <Navigate to="/" /> : <Login onLogin={handleLogin} />}
          />
          <Route
            path="/"
            element={user ? <Dashboard /> : <Navigate to="/login" />}
          />

          {/* Core Features */}
          <Route
            path="/products"
            element={user ? <ProductList /> : <Navigate to="/login" />}
          />
          <Route
            path="/products/:id"
            element={user ? <ProductDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/inspections"
            element={user ? <InspectionList /> : <Navigate to="/login" />}
          />
          <Route
            path="/inspections/:id"
            element={user ? <InspectionDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/defects"
            element={user ? <DefectList /> : <Navigate to="/login" />}
          />
          <Route
            path="/defects/:id"
            element={user ? <DefectDetail /> : <Navigate to="/login" />}
          />
          <Route
            path="/ai-analysis"
            element={user ? <AIAnalysis /> : <Navigate to="/login" />}
          />
          <Route
            path="/reports"
            element={user ? <ReportList /> : <Navigate to="/login" />}
          />
          <Route
            path="/reports/:id"
            element={user ? <ReportDetail /> : <Navigate to="/login" />}
          />

          {/* AI Defect Classifier */}
          <Route
            path="/defect-classifier"
            element={user ? <DefectClassifierList /> : <Navigate to="/login" />}
          />
          <Route
            path="/defect-classifier/:id"
            element={user ? <DefectClassifierDetail /> : <Navigate to="/login" />}
          />

          {/* AI Severity Scorer */}
          <Route
            path="/severity-scorer"
            element={user ? <SeverityScorerList /> : <Navigate to="/login" />}
          />
          <Route
            path="/severity-scorer/:id"
            element={user ? <SeverityScorerDetail /> : <Navigate to="/login" />}
          />

          {/* AI Root Cause Analyzer */}
          <Route
            path="/root-cause"
            element={user ? <RootCauseList /> : <Navigate to="/login" />}
          />
          <Route
            path="/root-cause/:id"
            element={user ? <RootCauseDetail /> : <Navigate to="/login" />}
          />

          {/* AI Trend Tracker */}
          <Route
            path="/trend-tracker"
            element={user ? <TrendTrackerList /> : <Navigate to="/login" />}
          />
          <Route
            path="/trend-tracker/:id"
            element={user ? <TrendTrackerDetail /> : <Navigate to="/login" />}
          />

          {/* AI Quality Inspector */}
          <Route
            path="/quality-inspector"
            element={user ? <QualityInspectorList /> : <Navigate to="/login" />}
          />
          <Route
            path="/quality-inspector/:id"
            element={user ? <QualityInspectorDetail /> : <Navigate to="/login" />}
          />

          {/* AI Packaging Optimizer */}
          <Route
            path="/packaging-optimizer"
            element={user ? <PackagingOptimizerList /> : <Navigate to="/login" />}
          />
          <Route
            path="/packaging-optimizer/:id"
            element={user ? <PackagingOptimizerDetail /> : <Navigate to="/login" />}
          />

          {/* AI Report Generator */}
          <Route
            path="/report-generator"
            element={user ? <AIReportGeneratorList /> : <Navigate to="/login" />}
          />
          <Route
            path="/report-generator/:id"
            element={user ? <AIReportGeneratorDetail /> : <Navigate to="/login" />}
          />

          {/* Batch Inspection */}
          <Route
            path="/batch-inspection"
            element={user ? <BatchInspectionList /> : <Navigate to="/login" />}
          />
          <Route
            path="/batch-inspection/:id"
            element={user ? <BatchInspectionDetail /> : <Navigate to="/login" />}
          />

          {/* Defect Trend Analytics */}
          <Route
            path="/defect-trend-analytics"
            element={user ? <DefectTrendAnalyticsDashboard /> : <Navigate to="/login" />}
          />

          {/* Reinspection Scheduler */}
          <Route
            path="/reinspection-scheduler"
            element={user ? <ReinspectionSchedulerList /> : <Navigate to="/login" />}
          />

          {/* MES Alerts */}
          <Route
            path="/mes-alerts"
            element={user ? <MESAlertsList /> : <Navigate to="/login" />}
          />

          {/* AI Predictive Quality */}
          <Route
            path="/predictive-quality"
            element={user ? <PredictiveQualityPage /> : <Navigate to="/login" />}
          />

          {/* AI Improvement Recommendations */}
          <Route
            path="/improvement-recommendations"
            element={user ? <ImprovementRecommendationsPage /> : <Navigate to="/login" />}
          />

          {/* AI Supplier Quality Score */}
          <Route
            path="/supplier-quality-score"
            element={user ? <SupplierQualityScorePage /> : <Navigate to="/login" />}
          />

          {/* AI Defect-Parameter Correlation */}
          <Route
            path="/defect-parameter-correlation"
            element={user ? <DefectParameterCorrelationPage /> : <Navigate to="/login" />}
          />

          {/* AI SPC Control Chart */}
          <Route
            path="/spc-control-chart"
            element={user ? <SPCControlChartPage /> : <Navigate to="/login" />}
          />
        {/* // === Batch 08 Gaps & Frontend Mounts === */}
      <Route path="/cf-computer-vision-defect-detector-running-on-line-cameras" element={<ProtectedRoute><CfComputerVisionDefectDetectorRunningOnLine /></ProtectedRoute>} />
      <Route path="/cf-predictive-quality-scoring-flagging-at-risk-production-runs" element={<ProtectedRoute><CfPredictiveQualityScoringFlaggingAtRiskProduction /></ProtectedRoute>} />
      <Route path="/cf-root-cause-correlation-tying-defects-to-process-parameters" element={<ProtectedRoute><CfRootCauseCorrelationTyingDefectsToProcess /></ProtectedRoute>} />
      <Route path="/cf-supplier-quality-tracking-scoring-supplier-defect-contributions" element={<ProtectedRoute><CfSupplierQualityTrackingScoringSupplierDefectContributions /></ProtectedRoute>} />
      <Route path="/cf-process-change-recommendation-engine-reducing-defect-rates" element={<ProtectedRoute><CfProcessChangeRecommendationEngineReducingDefectRates /></ProtectedRoute>} />
      <Route path="/cf-direct-mes-erp-integration-for-closed-loop-quality-control" element={<ProtectedRoute><CfDirectMesErpIntegrationForClosedLoop /></ProtectedRoute>} />
      <Route path="/gap-no-computer-vision-for-direct-defect-detection-from" element={<ProtectedRoute><GapNoComputerVisionForDirectDefectDetection /></ProtectedRoute>} />
      <Route path="/gap-no-predictive-quality-scoring-for-upcoming-production-runs" element={<ProtectedRoute><GapNoPredictiveQualityScoringForUpcomingProduction /></ProtectedRoute>} />
      <Route path="/gap-no-automated-root-cause-correlation-ml" element={<ProtectedRoute><GapNoAutomatedRootCauseCorrelationMl /></ProtectedRoute>} />
      <Route path="/gap-limited-integration-with-production-line-cameras-only-generic-integrations" element={<ProtectedRoute><GapLimitedIntegrationWithProductionLineCamerasOnly /></ProtectedRoute>} />
      <Route path="/gap-no-real-time-spc-statistical-process-control-visualization" element={<ProtectedRoute><GapNoRealTimeSpcStatisticalProcessControl /></ProtectedRoute>} />
      <Route path="/gap-no-erp-integration-for-rework-scrap-tracking" element={<ProtectedRoute><GapNoErpIntegrationForReworkScrapTracking /></ProtectedRoute>} />
      <Route path="/gap-no-supplier-quality-management-module" element={<ProtectedRoute><GapNoSupplierQualityManagementModule /></ProtectedRoute>} />
      <Route path="/gap-no-webhooks-for-mes-events-beyond-the-alert" element={<ProtectedRoute><GapNoWebhooksForMesEventsBeyondThe /></ProtectedRoute>} />
      <Route path="/gap-no-notifications-subsystem" element={<ProtectedRoute><GapNoNotificationsSubsystem /></ProtectedRoute>} />
      </Routes>
      </div>
    </Router>
  );
}

export default App;
