import React from 'react';
import DefectDetectionChart from './DefectDetectionChart';
import StationDefectHeatmap from './StationDefectHeatmap';
import QAInspectionReportPDF from './QAInspectionReportPDF';
import InspectionRulesEditor from './InspectionRulesEditor';

export default function CustomViewsPage() {
  return (
    <main style={{ padding: 24, marginLeft: 0, maxWidth: 1100 }}>
      <header style={{ marginBottom: 16 }}>
        <h1 style={{ margin: 0 }}>QA Custom Views</h1>
        <p style={{ color: '#6b7280', marginTop: 4 }}>
          4 specialized custom views for visual QA inspection: defect detection
          trend chart, station heatmap, downloadable PDF report, and an
          inspection-rules CRUD editor per product line.
        </p>
      </header>

      <section style={{ display: 'grid', gap: 20 }}>
        <DefectDetectionChart />
        <StationDefectHeatmap />
        <QAInspectionReportPDF />
        <InspectionRulesEditor />
      </section>
    </main>
  );
}
