import React from 'react';
import FullFieldPresets from './FullFieldPresets';

// These are example observations, never database records or uploaded files.
const examples = {
  classifier: [
    { defect_name: 'Hairline solder trace crack', defect_description: 'A 2 mm crack beside the processor pad appeared in three boards during final visual inspection. Confirm lot and microscope findings.', category: 'Electrical', sub_category: 'Solder trace' },
    { defect_name: 'Enclosure surface scratch', defect_description: 'Fine scratches on the front enclosure were found after assembly. Compare packing and handling stations before assigning cause.', category: 'Cosmetic', sub_category: 'Surface finish' },
    { defect_name: 'Intermittent connector contact', defect_description: 'Continuity checks intermittently fail after vibration testing. Inspect connector seating and record the affected batch.', category: 'Electrical', sub_category: 'Connector' },
  ],
  severity: [
    { issue_name: 'Motor overheating', issue_description: 'Assembly motor reaches 95 C against an 80 C limit; two unplanned stops occurred this week. Inspect bearings and cooling.', severity_level: 'high' },
    { issue_name: 'Cosmetic panel scratches', issue_description: 'Twelve panels from the latest batch show shallow scratches after packing. Functional tests pass; assess customer impact.', severity_level: 'low' },
    { issue_name: 'Intermittent safety interlock', issue_description: 'The guard interlock occasionally fails its prestart check. Hold affected units pending root cause and containment.', severity_level: 'critical' },
  ],
  rootCause: [
    { problem_name: 'Paint line rejection increase', problem_description: 'Rejection rose from 3% to 15% after a primer supplier change. Orange peel and runs occur on several shifts; booth readings remain in range.' },
    { problem_name: 'Fastener torque variation', problem_description: 'End of line torque readings vary across two batches. Compare tool calibration, operator shifts, and material lots before concluding cause.' },
    { problem_name: 'Assembly seal leakage', problem_description: 'Three units failed pressure testing after a fixture service. Review seal dimensions, fixture setup, and test records.' },
  ],
  inspector: [
    { inspection_name: 'Final assembly visual check', batch_number: 'EXAMPLE-BATCH-A', inspection_type: 'Final QC', inspector_name: 'Example inspector', parameters: '{"surface_finish":"Ra 0.8","coating_thickness_um":"25-35"}' },
    { inspection_name: 'Incoming fastener inspection', batch_number: 'EXAMPLE-BATCH-B', inspection_type: 'Incoming', inspector_name: 'Example receiving team', parameters: '{"diameter_mm":"6.00 +/- 0.05","thread":"M6"}' },
    { inspection_name: 'In process seal inspection', batch_number: 'EXAMPLE-BATCH-C', inspection_type: 'In-Process', inspector_name: 'Example line operator', parameters: '{"seal_width_mm":"4.0 +/- 0.2","visual":"no nicks"}' },
  ],
  packaging: [
    { optimization_name: 'Electronics transit protection', current_packaging: 'Corrugated carton with foam inserts', product_weight: '3.2', fragility_level: 'high', shipping_requirements: 'Air and ground shipping; maintain upright orientation.', optimization_goals: 'Reduce damage, Reduce volume, Improve recyclability' },
    { optimization_name: 'Fastener bulk carton review', current_packaging: 'Double wall carton with loose poly bags', product_weight: '8.5', fragility_level: 'low', shipping_requirements: 'Stackable pallets; keep dry in transit.', optimization_goals: 'Reduce cost, Improve labeling, Reduce waste' },
    { optimization_name: 'Optical sensor shipment', current_packaging: 'Molded tray in small corrugated box', product_weight: '0.7', fragility_level: 'very_high', shipping_requirements: 'Protect optics from shock and dust during international shipping.', optimization_goals: 'Improve protection, Reduce returns, Reuse trays' },
  ],
  generator: [
    { report_name: 'Example quarterly quality summary', report_type: 'quality_summary', report_scope: 'Summarize inspected units, defect rates, yield, and actions for the quarter. Distinguish missing data from measured results.' },
    { report_name: 'Example defect trend review', report_type: 'defect_analysis', report_scope: 'Compare the top defect families by batch and line; identify containment, suspected causes, and evidence to collect.' },
    { report_name: 'Example executive quality brief', report_type: 'executive_summary', report_scope: 'Present quality risks, customer impact, owners, and decisions needed. Flag unverified metrics.' },
  ],
  trend: [
    { trend_name: 'Example monthly defect trend', analysis_period: 'January–June 2026', trend_type: 'Defect Rate', data_points: '4.2, 3.8, 4.5, 3.1, 2.9, 2.4' },
    { trend_name: 'Example weekly yield review', analysis_period: 'Six recent weeks', trend_type: 'Yield Rate', data_points: '91.2, 92.1, 90.8, 93.4, 94.0, 94.5' },
    { trend_name: 'Example quality score trend', analysis_period: 'First half of 2026', trend_type: 'Quality Score', data_points: '84, 86, 85, 88, 90, 91' },
  ],
  predictive: [
    { product: 'Example precision fastener', line: 'Line A', historical_defect_rate: '2.4', threshold: '3.0', parameters: '{"temperature_c":178,"speed_rpm":1200}' },
    { product: 'Example optical sensor', line: 'Line B', historical_defect_rate: '1.1', threshold: '2.0', parameters: '{"humidity_pct":42,"calibration_offset":0.03}' },
    { product: 'Example actuator housing', line: 'Line C', historical_defect_rate: '4.2', threshold: '3.5', parameters: '{"pressure_bar":5.2,"cycle_seconds":18}' },
  ],
  improvement: [
    { product: 'Example coated housing', timeframe_days: 30, pain_points: 'Coating thickness varies and rework is increasing on Line B.', metrics: '{"defect_rate_pct":4.1,"rework_pct":6.8}' },
    { product: 'Example fastener', timeframe_days: 60, pain_points: 'Torque variation increases at shift changes.', metrics: '{"first_pass_yield_pct":92,"scrap_pct":2.2}' },
    { product: 'Example optical sensor', timeframe_days: 90, pain_points: 'Calibration drift drives retesting and delayed shipments.', metrics: '{"retest_pct":7.5,"on_time_delivery_pct":91}' },
  ],
  correlation: [
    { productLine: 'Line A', lookbackDays: 30, defectSeries: '[{"ts":"2026-09-01","count":5,"type":"scratch"},{"ts":"2026-09-02","count":12,"type":"scratch"}]', parameterSeries: '[{"ts":"2026-09-01","speed":120,"temp":182},{"ts":"2026-09-02","speed":130,"temp":195}]' },
    { productLine: 'Line B', lookbackDays: 45, defectSeries: '[{"ts":"2026-08-20","count":2,"type":"leak"},{"ts":"2026-08-21","count":8,"type":"leak"}]', parameterSeries: '[{"ts":"2026-08-20","pressure":5.0},{"ts":"2026-08-21","pressure":5.8}]' },
    { productLine: 'Line C', lookbackDays: 14, defectSeries: '[{"ts":"2026-09-10","count":3,"type":"chip"},{"ts":"2026-09-11","count":9,"type":"chip"}]', parameterSeries: '[{"ts":"2026-09-10","humidity":40},{"ts":"2026-09-11","humidity":58}]' },
  ],
  spc: [
    { measurement: 'fastener_diameter_mm', target: 6, subgroups: '[[6.01,5.99,6.02],[6.00,6.01,5.97],[6.05,6.10,6.07]]' },
    { measurement: 'coating_thickness_um', target: 30, subgroups: '[[30.1,29.8,30.2],[29.9,30.0,30.1],[31.0,30.8,31.2]]' },
    { measurement: 'seal_width_mm', target: 4, subgroups: '[[4.01,3.99,4.02],[4.00,3.98,4.01],[4.08,4.06,4.07]]' },
  ],
  supplier: [
    { supplierName: 'Example fastener supplier', productCategory: 'Precision fasteners', lookbackDays: 180, onTimeDeliveryPct: 92.4, reworkRatePct: 3.1, defectStats: '{"ppm":1850,"topDefects":["thread damage"]}', certifications: '["ISO 9001"]', auditFindings: '[{"finding":"Sampling documentation","status":"open"}]', historicalIncidents: '[{"type":"shipment hold","cause":"plating drift"}]' },
    { supplierName: 'Example sensor supplier', productCategory: 'Optical sensors', lookbackDays: 90, onTimeDeliveryPct: 97.2, reworkRatePct: 1.2, defectStats: '{"ppm":420,"topDefects":["calibration drift"]}', certifications: '["ISO 9001","ISO 14001"]', auditFindings: '[{"finding":"Calibration records","status":"closed"}]', historicalIncidents: '[{"type":"late delivery","cause":"test backlog"}]' },
    { supplierName: 'Example packaging supplier', productCategory: 'Transit packaging', lookbackDays: 365, onTimeDeliveryPct: 88.5, reworkRatePct: 4.4, defectStats: '{"ppm":2500,"topDefects":["crushed carton"]}', certifications: '["ISO 9001"]', auditFindings: '[{"finding":"Pallet handling","status":"open"}]', historicalIncidents: '[{"type":"damage claim","cause":"stacking"}]' },
  ],
};

export default function NativeAIPresets({ kind, value, onChange, products, disabled }) {
  const source = examples[kind];
  const selectedProduct = value.product_id || products?.[0]?.id || '';
  const presets = source.map((fields, index) => ({
    label: ['Example A', 'Example B', 'Example C'][index],
    values: { ...fields, ...(Object.hasOwn(value, 'product_id') ? { product_id: selectedProduct } : {}) },
  }));
  return <><FullFieldPresets value={value} presets={presets} disabled={disabled} onChange={onChange} />{Object.hasOwn(value, 'product_id') && !selectedProduct && <p role="status">Select an existing product to complete this example.</p>}</>;
}
