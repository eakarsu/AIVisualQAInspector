const bcrypt = require('bcryptjs');
require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const {
  sequelize,
  User,
  Product,
  Inspection,
  Defect,
  InspectionReport,
  DefectClassification,
  SeverityScore,
  RootCauseAnalysis,
  TrendAnalysis,
  QualityInspection,
  PackagingOptimization,
  AIReport
} = require('../models');

const seedData = async () => {
  try {
    console.log('Starting database seed...');

    // Sync database
    await sequelize.sync({ force: true });
    console.log('Database synced');

    // Create demo user
    const hashedPassword = await bcrypt.hash('password123', 10);
    await User.create({
      email: 'demo@example.com',
      password: hashedPassword,
      name: 'Demo User'
    });
    console.log('Demo user created');

    // Create products (18 items)
    const products = await Product.bulkCreate([
      { name: 'Industrial Circuit Board A1', sku: 'PCB-001', category: 'Electronics', description: 'High-precision circuit board for industrial applications' },
      { name: 'Steel Bearing Assembly', sku: 'MEC-002', category: 'Mechanical', description: 'Heavy-duty bearing assembly for machinery' },
      { name: 'LED Display Panel 24"', sku: 'DSP-003', category: 'Electronics', description: 'Commercial grade LED display panel' },
      { name: 'Aluminum Heat Sink', sku: 'THR-004', category: 'Thermal', description: 'High-efficiency aluminum heat sink for cooling' },
      { name: 'Precision Gear Set', sku: 'MEC-005', category: 'Mechanical', description: 'CNC machined precision gear set' },
      { name: 'Optical Sensor Module', sku: 'SEN-006', category: 'Electronics', description: 'High-sensitivity optical sensor module' },
      { name: 'Rubber Gasket Kit', sku: 'SEA-007', category: 'Sealing', description: 'Industrial rubber gasket kit for sealing applications' },
      { name: 'Stainless Steel Valve', sku: 'FLW-008', category: 'Flow Control', description: 'Corrosion-resistant stainless steel valve' },
      { name: 'Power Supply Unit 500W', sku: 'PWR-009', category: 'Electronics', description: 'Industrial grade power supply unit' },
      { name: 'Carbon Fiber Panel', sku: 'MAT-010', category: 'Materials', description: 'Lightweight carbon fiber composite panel' },
      { name: 'Hydraulic Cylinder', sku: 'HYD-011', category: 'Hydraulics', description: 'Heavy-duty hydraulic cylinder assembly' },
      { name: 'Ceramic Insulator', sku: 'INS-012', category: 'Electrical', description: 'High-voltage ceramic insulator' },
      { name: 'Pneumatic Actuator', sku: 'PNE-013', category: 'Pneumatics', description: 'Industrial pneumatic actuator' },
      { name: 'Copper Wiring Harness', sku: 'WIR-014', category: 'Electrical', description: 'Custom copper wiring harness assembly' },
      { name: 'Titanium Fastener Set', sku: 'FAS-015', category: 'Hardware', description: 'Aerospace-grade titanium fastener set' },
      { name: 'Silicone Tubing Kit', sku: 'TUB-016', category: 'Flow Control', description: 'Medical-grade silicone tubing kit' },
      { name: 'Motor Controller Board', sku: 'CTL-017', category: 'Electronics', description: 'Programmable motor controller board' },
      { name: 'Polymer Bushing Set', sku: 'BUS-018', category: 'Mechanical', description: 'Low-friction polymer bushing set' }
    ]);
    console.log(`${products.length} products created`);

    // Create inspections (18 items)
    const inspections = await Inspection.bulkCreate([
      { product_id: 1, inspector_name: 'John Smith', status: 'completed', notes: 'All solder joints inspected. Quality meets standards.' },
      { product_id: 2, inspector_name: 'Sarah Johnson', status: 'completed', notes: 'Bearing tolerances within specification.' },
      { product_id: 3, inspector_name: 'Mike Chen', status: 'failed', notes: 'Dead pixels detected in corner region.' },
      { product_id: 4, inspector_name: 'Emily Davis', status: 'completed', notes: 'Thermal conductivity verified.' },
      { product_id: 5, inspector_name: 'Robert Wilson', status: 'in_progress', notes: 'Gear mesh inspection ongoing.' },
      { product_id: 6, inspector_name: 'John Smith', status: 'completed', notes: 'Sensor calibration verified.' },
      { product_id: 7, inspector_name: 'Sarah Johnson', status: 'pending', notes: 'Awaiting pressure test.' },
      { product_id: 8, inspector_name: 'Mike Chen', status: 'completed', notes: 'No leaks detected under pressure.' },
      { product_id: 9, inspector_name: 'Emily Davis', status: 'failed', notes: 'Voltage regulation outside tolerance.' },
      { product_id: 10, inspector_name: 'Robert Wilson', status: 'completed', notes: 'Structural integrity confirmed.' },
      { product_id: 11, inspector_name: 'John Smith', status: 'in_progress', notes: 'Pressure testing in progress.' },
      { product_id: 12, inspector_name: 'Sarah Johnson', status: 'completed', notes: 'Insulation resistance verified.' },
      { product_id: 13, inspector_name: 'Mike Chen', status: 'pending', notes: 'Scheduled for actuation test.' },
      { product_id: 14, inspector_name: 'Emily Davis', status: 'completed', notes: 'Continuity test passed.' },
      { product_id: 15, inspector_name: 'Robert Wilson', status: 'completed', notes: 'Tensile strength within spec.' },
      { product_id: 16, inspector_name: 'John Smith', status: 'in_progress', notes: 'Biocompatibility testing.' },
      { product_id: 17, inspector_name: 'Sarah Johnson', status: 'failed', notes: 'PWM signal irregularities detected.' },
      { product_id: 18, inspector_name: 'Mike Chen', status: 'completed', notes: 'Friction coefficient acceptable.' }
    ]);
    console.log(`${inspections.length} inspections created`);

    // Create defects (16 items)
    const defects = await Defect.bulkCreate([
      { inspection_id: 3, product_id: 3, defect_type: 'Dead Pixels', severity: 'high', description: 'Cluster of 5 dead pixels in upper right corner', location: 'Upper right quadrant' },
      { inspection_id: 9, product_id: 9, defect_type: 'Voltage Irregularity', severity: 'critical', description: 'Output voltage fluctuates by 15% under load', location: 'Main output stage' },
      { inspection_id: 17, product_id: 17, defect_type: 'Signal Noise', severity: 'high', description: 'PWM signal shows 8% noise at high frequencies', location: 'Driver circuit' },
      { inspection_id: 1, product_id: 1, defect_type: 'Cold Solder Joint', severity: 'medium', description: 'Minor cold solder joint on capacitor C12', location: 'Power section' },
      { inspection_id: 2, product_id: 2, defect_type: 'Surface Scratch', severity: 'low', description: 'Superficial scratch on outer race', location: 'Outer bearing surface' },
      { inspection_id: 5, product_id: 5, defect_type: 'Tooth Wear', severity: 'medium', description: 'Slight wear pattern on gear teeth', location: 'Drive gear' },
      { inspection_id: 8, product_id: 8, defect_type: 'Corrosion', severity: 'low', description: 'Minor surface oxidation', location: 'Valve body exterior' },
      { inspection_id: 10, product_id: 10, defect_type: 'Delamination', severity: 'critical', description: 'Layer separation detected at edge', location: 'Panel edge, section 3' },
      { inspection_id: 11, product_id: 11, defect_type: 'Seal Wear', severity: 'high', description: 'Piston seal showing wear marks', location: 'Piston assembly' },
      { inspection_id: 12, product_id: 12, defect_type: 'Hairline Crack', severity: 'critical', description: 'Micro-crack detected in ceramic body', location: 'Lower insulator section' },
      { inspection_id: 14, product_id: 14, defect_type: 'Insulation Damage', severity: 'medium', description: 'Minor insulation abrasion', location: 'Connector junction' },
      { inspection_id: 15, product_id: 15, defect_type: 'Thread Damage', severity: 'low', description: 'Slight thread deformation on one fastener', location: 'Fastener #7' },
      { inspection_id: 16, product_id: 16, defect_type: 'Contamination', severity: 'high', description: 'Particulate contamination detected', location: 'Inner tubing surface' },
      { inspection_id: 18, product_id: 18, defect_type: 'Dimensional Variance', severity: 'medium', description: 'ID slightly out of tolerance (+0.02mm)', location: 'Bushing bore' },
      { inspection_id: 4, product_id: 4, defect_type: 'Surface Finish', severity: 'low', description: 'Minor machining marks visible', location: 'Fin surface' },
      { inspection_id: 6, product_id: 6, defect_type: 'Lens Scratch', severity: 'medium', description: 'Light scratch on sensor lens', location: 'Optical window' }
    ]);
    console.log(`${defects.length} defects created`);

    // Create Defect Classifications (15 items)
    const classifications = await DefectClassification.bulkCreate([
      { defect_id: 1, product_id: 3, defect_name: 'Dead Pixel Cluster', defect_description: 'Multiple dead pixels grouped together', category: 'Display Defects', sub_category: 'Pixel Failures', confidence_score: 95 },
      { defect_id: 2, product_id: 9, defect_name: 'Voltage Regulation Failure', defect_description: 'Power output instability under load', category: 'Electrical Defects', sub_category: 'Power Issues', confidence_score: 92 },
      { defect_id: 3, product_id: 17, defect_name: 'PWM Signal Degradation', defect_description: 'Noise interference in motor control', category: 'Signal Defects', sub_category: 'Noise Issues', confidence_score: 88 },
      { defect_id: 4, product_id: 1, defect_name: 'Solder Joint Defect', defect_description: 'Incomplete solder connection', category: 'Manufacturing Defects', sub_category: 'Assembly Issues', confidence_score: 90 },
      { defect_id: 5, product_id: 2, defect_name: 'Surface Damage', defect_description: 'Cosmetic surface imperfection', category: 'Surface Defects', sub_category: 'Scratches', confidence_score: 97 },
      { defect_id: 6, product_id: 5, defect_name: 'Gear Wear Pattern', defect_description: 'Premature wear on gear teeth', category: 'Mechanical Defects', sub_category: 'Wear Issues', confidence_score: 85 },
      { defect_id: 7, product_id: 8, defect_name: 'Surface Corrosion', defect_description: 'Oxidation on metal surface', category: 'Material Defects', sub_category: 'Corrosion', confidence_score: 93 },
      { defect_id: 8, product_id: 10, defect_name: 'Composite Delamination', defect_description: 'Layer separation in composite', category: 'Structural Defects', sub_category: 'Bonding Failures', confidence_score: 91 },
      { defect_id: 9, product_id: 11, defect_name: 'Seal Degradation', defect_description: 'Hydraulic seal wear', category: 'Sealing Defects', sub_category: 'Wear', confidence_score: 87 },
      { defect_id: 10, product_id: 12, defect_name: 'Ceramic Fracture', defect_description: 'Structural crack in ceramic', category: 'Structural Defects', sub_category: 'Fractures', confidence_score: 94 },
      { defect_id: 11, product_id: 14, defect_name: 'Wire Insulation Damage', defect_description: 'Compromised wire coating', category: 'Electrical Defects', sub_category: 'Insulation', confidence_score: 89 },
      { defect_id: 12, product_id: 15, defect_name: 'Thread Deformation', defect_description: 'Damaged fastener threads', category: 'Mechanical Defects', sub_category: 'Thread Issues', confidence_score: 96 },
      { defect_id: 13, product_id: 16, defect_name: 'Foreign Particle Contamination', defect_description: 'Particles in medical tubing', category: 'Contamination Defects', sub_category: 'Particulate', confidence_score: 92 },
      { defect_id: 14, product_id: 18, defect_name: 'Dimensional Non-Conformance', defect_description: 'Out of tolerance dimension', category: 'Dimensional Defects', sub_category: 'Tolerance', confidence_score: 98 },
      { defect_id: 15, product_id: 4, defect_name: 'Machining Marks', defect_description: 'Visible tool marks on surface', category: 'Surface Defects', sub_category: 'Machining', confidence_score: 94 }
    ]);
    console.log(`${classifications.length} defect classifications created`);

    // Create Severity Scores (15 items)
    const severityScores = await SeverityScore.bulkCreate([
      { defect_id: 1, product_id: 3, issue_name: 'Display Dead Pixels', issue_description: 'Multiple dead pixels affecting display quality', severity_level: 'high', severity_score: 75, impact_analysis: { customer: 'High', functional: 'Medium' } },
      { defect_id: 2, product_id: 9, issue_name: 'Power Supply Instability', issue_description: 'Voltage fluctuations under load conditions', severity_level: 'critical', severity_score: 95, impact_analysis: { safety: 'High', operational: 'Critical' } },
      { defect_id: 3, product_id: 17, issue_name: 'Motor Control Noise', issue_description: 'Signal interference affecting motor precision', severity_level: 'high', severity_score: 78, impact_analysis: { performance: 'High', reliability: 'Medium' } },
      { defect_id: 4, product_id: 1, issue_name: 'PCB Solder Quality', issue_description: 'Cold solder joint reliability concern', severity_level: 'medium', severity_score: 55, impact_analysis: { reliability: 'Medium', longevity: 'Medium' } },
      { defect_id: 5, product_id: 2, issue_name: 'Bearing Surface Quality', issue_description: 'Cosmetic scratch on bearing', severity_level: 'low', severity_score: 25, impact_analysis: { cosmetic: 'Low', functional: 'None' } },
      { defect_id: 6, product_id: 5, issue_name: 'Gear Durability', issue_description: 'Early wear pattern on gear teeth', severity_level: 'medium', severity_score: 60, impact_analysis: { lifespan: 'Medium', performance: 'Low' } },
      { defect_id: 7, product_id: 8, issue_name: 'Valve Corrosion', issue_description: 'Surface oxidation on valve body', severity_level: 'low', severity_score: 30, impact_analysis: { cosmetic: 'Medium', structural: 'Low' } },
      { defect_id: 8, product_id: 10, issue_name: 'Panel Structural Integrity', issue_description: 'Delamination at panel edge', severity_level: 'critical', severity_score: 90, impact_analysis: { structural: 'Critical', safety: 'High' } },
      { defect_id: 9, product_id: 11, issue_name: 'Hydraulic Seal Wear', issue_description: 'Seal showing signs of wear', severity_level: 'high', severity_score: 72, impact_analysis: { functional: 'High', maintenance: 'High' } },
      { defect_id: 10, product_id: 12, issue_name: 'Insulator Crack', issue_description: 'Hairline crack in ceramic insulator', severity_level: 'critical', severity_score: 98, impact_analysis: { safety: 'Critical', electrical: 'Critical' } },
      { defect_id: 11, product_id: 14, issue_name: 'Wire Insulation', issue_description: 'Minor insulation damage', severity_level: 'medium', severity_score: 58, impact_analysis: { electrical: 'Medium', safety: 'Medium' } },
      { defect_id: 12, product_id: 15, issue_name: 'Fastener Thread Quality', issue_description: 'Slight thread deformation', severity_level: 'low', severity_score: 22, impact_analysis: { functional: 'Low', assembly: 'Low' } },
      { defect_id: 13, product_id: 16, issue_name: 'Medical Tubing Cleanliness', issue_description: 'Particulate contamination detected', severity_level: 'high', severity_score: 85, impact_analysis: { safety: 'High', compliance: 'High' } },
      { defect_id: 14, product_id: 18, issue_name: 'Bushing Tolerance', issue_description: 'Dimensional variance from spec', severity_level: 'medium', severity_score: 52, impact_analysis: { fit: 'Medium', performance: 'Low' } },
      { defect_id: 15, product_id: 4, issue_name: 'Heat Sink Finish', issue_description: 'Surface finish quality concern', severity_level: 'low', severity_score: 18, impact_analysis: { cosmetic: 'Low', thermal: 'None' } }
    ]);
    console.log(`${severityScores.length} severity scores created`);

    // Create Root Cause Analyses (15 items)
    const rootCauses = await RootCauseAnalysis.bulkCreate([
      { defect_id: 1, product_id: 3, problem_name: 'Dead Pixel Investigation', problem_description: 'Multiple dead pixels in display panel', root_causes: [{ level: 1, cause: 'TFT transistor failure' }], contributing_factors: { material: ['LCD quality'], process: ['Assembly temperature'] } },
      { defect_id: 2, product_id: 9, problem_name: 'Power Output Analysis', problem_description: 'Voltage regulation failure under load', root_causes: [{ level: 1, cause: 'Capacitor degradation' }], contributing_factors: { component: ['Capacitor quality'], design: ['Thermal management'] } },
      { defect_id: 3, product_id: 17, problem_name: 'Signal Noise Investigation', problem_description: 'PWM signal interference', root_causes: [{ level: 1, cause: 'EMI shielding insufficient' }], contributing_factors: { design: ['PCB layout'], environment: ['Electromagnetic interference'] } },
      { defect_id: 4, product_id: 1, problem_name: 'Solder Quality Analysis', problem_description: 'Cold solder joint formation', root_causes: [{ level: 1, cause: 'Insufficient reflow temperature' }], contributing_factors: { process: ['Reflow profile'], equipment: ['Oven calibration'] } },
      { defect_id: 5, product_id: 2, problem_name: 'Surface Damage Analysis', problem_description: 'Scratch on bearing surface', root_causes: [{ level: 1, cause: 'Handling damage during packaging' }], contributing_factors: { process: ['Packaging procedure'], training: ['Operator awareness'] } },
      { defect_id: 6, product_id: 5, problem_name: 'Gear Wear Investigation', problem_description: 'Premature gear tooth wear', root_causes: [{ level: 1, cause: 'Material hardness below spec' }], contributing_factors: { material: ['Heat treatment'], design: ['Load calculations'] } },
      { defect_id: 7, product_id: 8, problem_name: 'Corrosion Analysis', problem_description: 'Surface oxidation on valve', root_causes: [{ level: 1, cause: 'Inadequate surface treatment' }], contributing_factors: { process: ['Passivation'], storage: ['Humidity control'] } },
      { defect_id: 8, product_id: 10, problem_name: 'Delamination Investigation', problem_description: 'Layer separation in composite', root_causes: [{ level: 1, cause: 'Cure cycle deviation' }], contributing_factors: { process: ['Autoclave temperature'], material: ['Resin age'] } },
      { defect_id: 9, product_id: 11, problem_name: 'Seal Wear Analysis', problem_description: 'Hydraulic seal degradation', root_causes: [{ level: 1, cause: 'Seal material incompatibility' }], contributing_factors: { material: ['Seal compound'], fluid: ['Hydraulic fluid type'] } },
      { defect_id: 10, product_id: 12, problem_name: 'Ceramic Crack Investigation', problem_description: 'Hairline crack in insulator', root_causes: [{ level: 1, cause: 'Thermal shock during sintering' }], contributing_factors: { process: ['Cooling rate'], material: ['Raw material purity'] } },
      { defect_id: 11, product_id: 14, problem_name: 'Insulation Damage Analysis', problem_description: 'Wire coating abrasion', root_causes: [{ level: 1, cause: 'Sharp edge contact' }], contributing_factors: { design: ['Routing path'], assembly: ['Edge protection'] } },
      { defect_id: 12, product_id: 15, problem_name: 'Thread Damage Investigation', problem_description: 'Fastener thread deformation', root_causes: [{ level: 1, cause: 'Cross-threading during assembly' }], contributing_factors: { process: ['Torque sequence'], training: ['Assembly technique'] } },
      { defect_id: 13, product_id: 16, problem_name: 'Contamination Analysis', problem_description: 'Particulates in medical tubing', root_causes: [{ level: 1, cause: 'Clean room protocol breach' }], contributing_factors: { environment: ['Clean room class'], process: ['Handling procedures'] } },
      { defect_id: 14, product_id: 18, problem_name: 'Dimensional Variance Analysis', problem_description: 'Bushing out of tolerance', root_causes: [{ level: 1, cause: 'Tool wear' }], contributing_factors: { equipment: ['Tooling condition'], process: ['Measurement frequency'] } },
      { defect_id: 15, product_id: 4, problem_name: 'Surface Finish Investigation', problem_description: 'Visible machining marks', root_causes: [{ level: 1, cause: 'Feed rate too high' }], contributing_factors: { process: ['Cutting parameters'], equipment: ['Tool selection'] } }
    ]);
    console.log(`${rootCauses.length} root cause analyses created`);

    // Create Trend Analyses (15 items)
    const trends = await TrendAnalysis.bulkCreate([
      { product_id: 1, trend_name: 'PCB Defect Rate Trend', analysis_period: 'Q1 2024', trend_type: 'Defect Rate', data_points: [2.1, 1.8, 1.5, 1.2], metrics: { average: 1.65, trend: 'decreasing' }, patterns: [{ name: 'Improvement', description: 'Steady decline' }] },
      { product_id: 2, trend_name: 'Bearing Quality Metrics', analysis_period: 'Q1 2024', trend_type: 'Quality Score', data_points: [92, 94, 93, 95], metrics: { average: 93.5, trend: 'stable' }, patterns: [{ name: 'Consistency', description: 'Stable quality' }] },
      { product_id: 3, trend_name: 'Display Panel Yields', analysis_period: 'Q1 2024', trend_type: 'Yield Rate', data_points: [88, 85, 82, 80], metrics: { average: 83.75, trend: 'decreasing' }, patterns: [{ name: 'Decline', description: 'Yield dropping' }] },
      { product_id: 4, trend_name: 'Heat Sink Thermal Performance', analysis_period: 'Q1 2024', trend_type: 'Performance', data_points: [95, 96, 95, 97], metrics: { average: 95.75, trend: 'stable' }, patterns: [{ name: 'Excellence', description: 'High performance' }] },
      { product_id: 5, trend_name: 'Gear Set Rejection Rate', analysis_period: 'Q1 2024', trend_type: 'Rejection Rate', data_points: [3.2, 2.8, 3.5, 2.5], metrics: { average: 3.0, trend: 'volatile' }, patterns: [{ name: 'Fluctuation', description: 'Variable quality' }] },
      { product_id: 6, trend_name: 'Sensor Calibration Accuracy', analysis_period: 'Q1 2024', trend_type: 'Accuracy', data_points: [99.1, 99.3, 99.2, 99.5], metrics: { average: 99.27, trend: 'improving' }, patterns: [{ name: 'Precision', description: 'High accuracy maintained' }] },
      { product_id: 7, trend_name: 'Gasket Seal Performance', analysis_period: 'Q1 2024', trend_type: 'Performance', data_points: [97, 96, 98, 97], metrics: { average: 97, trend: 'stable' }, patterns: [{ name: 'Reliability', description: 'Consistent sealing' }] },
      { product_id: 8, trend_name: 'Valve Leak Test Results', analysis_period: 'Q1 2024', trend_type: 'Pass Rate', data_points: [99.5, 99.8, 99.6, 99.9], metrics: { average: 99.7, trend: 'improving' }, patterns: [{ name: 'Excellence', description: 'Near-perfect results' }] },
      { product_id: 9, trend_name: 'PSU Failure Analysis', analysis_period: 'Q1 2024', trend_type: 'Failure Rate', data_points: [1.2, 1.5, 1.8, 2.1], metrics: { average: 1.65, trend: 'increasing' }, patterns: [{ name: 'Concern', description: 'Rising failures' }] },
      { product_id: 10, trend_name: 'Carbon Fiber Strength Testing', analysis_period: 'Q1 2024', trend_type: 'Strength', data_points: [100, 98, 99, 97], metrics: { average: 98.5, trend: 'slight_decline' }, patterns: [{ name: 'Watch', description: 'Minor decline' }] },
      { product_id: 11, trend_name: 'Hydraulic Cylinder Performance', analysis_period: 'Q1 2024', trend_type: 'Performance', data_points: [94, 95, 93, 96], metrics: { average: 94.5, trend: 'stable' }, patterns: [{ name: 'Good', description: 'Consistent performance' }] },
      { product_id: 12, trend_name: 'Insulator Dielectric Strength', analysis_period: 'Q1 2024', trend_type: 'Dielectric', data_points: [100, 100, 99, 100], metrics: { average: 99.75, trend: 'stable' }, patterns: [{ name: 'Excellent', description: 'Meets all specs' }] },
      { product_id: 13, trend_name: 'Actuator Response Time', analysis_period: 'Q1 2024', trend_type: 'Response', data_points: [45, 42, 40, 38], metrics: { average: 41.25, trend: 'improving' }, patterns: [{ name: 'Faster', description: 'Response improving' }] },
      { product_id: 14, trend_name: 'Wiring Harness Quality', analysis_period: 'Q1 2024', trend_type: 'Quality', data_points: [96, 97, 96, 98], metrics: { average: 96.75, trend: 'stable' }, patterns: [{ name: 'Reliable', description: 'High quality maintained' }] },
      { product_id: 15, trend_name: 'Fastener Torque Consistency', analysis_period: 'Q1 2024', trend_type: 'Consistency', data_points: [98, 99, 98, 99], metrics: { average: 98.5, trend: 'excellent' }, patterns: [{ name: 'Precision', description: 'Excellent consistency' }] }
    ]);
    console.log(`${trends.length} trend analyses created`);

    // Create Quality Inspections (15 items)
    const qualityInspections = await QualityInspection.bulkCreate([
      { product_id: 1, inspection_name: 'PCB Final Inspection', batch_number: 'PCB-2024-001', inspection_type: 'Final QC', inspector_name: 'John Smith', status: 'passed', quality_score: 95, parameters: { solder_quality: 'A', component_placement: 'A' } },
      { product_id: 2, inspection_name: 'Bearing Assembly Check', batch_number: 'BRG-2024-015', inspection_type: 'Assembly QC', inspector_name: 'Sarah Johnson', status: 'passed', quality_score: 98, parameters: { tolerance: '0.001mm', runout: '0.002mm' } },
      { product_id: 3, inspection_name: 'Display Panel Visual Test', batch_number: 'DSP-2024-008', inspection_type: 'Visual Inspection', inspector_name: 'Mike Chen', status: 'failed', quality_score: 72, parameters: { dead_pixels: 5, brightness: '95%' } },
      { product_id: 4, inspection_name: 'Heat Sink Thermal Test', batch_number: 'HS-2024-022', inspection_type: 'Thermal Testing', inspector_name: 'Emily Davis', status: 'passed', quality_score: 96, parameters: { thermal_resistance: '0.5C/W', surface_flatness: '0.02mm' } },
      { product_id: 5, inspection_name: 'Gear Set Mesh Analysis', batch_number: 'GR-2024-011', inspection_type: 'Mechanical Test', inspector_name: 'Robert Wilson', status: 'needs_review', quality_score: 85, parameters: { backlash: '0.05mm', noise: '35dB' } },
      { product_id: 6, inspection_name: 'Sensor Calibration Verify', batch_number: 'SEN-2024-033', inspection_type: 'Calibration', inspector_name: 'John Smith', status: 'passed', quality_score: 99, parameters: { accuracy: '99.5%', repeatability: '99.8%' } },
      { product_id: 7, inspection_name: 'Gasket Pressure Test', batch_number: 'GSK-2024-019', inspection_type: 'Pressure Test', inspector_name: 'Sarah Johnson', status: 'pending', quality_score: null, parameters: { test_pressure: '150psi', duration: '30min' } },
      { product_id: 8, inspection_name: 'Valve Leak Test', batch_number: 'VLV-2024-027', inspection_type: 'Leak Testing', inspector_name: 'Mike Chen', status: 'passed', quality_score: 100, parameters: { leak_rate: '0cc/min', pressure: '200psi' } },
      { product_id: 9, inspection_name: 'PSU Load Test', batch_number: 'PSU-2024-014', inspection_type: 'Electrical Test', inspector_name: 'Emily Davis', status: 'failed', quality_score: 68, parameters: { voltage_regulation: '±8%', ripple: '50mV' } },
      { product_id: 10, inspection_name: 'Carbon Panel NDT', batch_number: 'CF-2024-006', inspection_type: 'NDT Inspection', inspector_name: 'Robert Wilson', status: 'passed', quality_score: 94, parameters: { ultrasonic: 'Pass', visual: 'Pass' } },
      { product_id: 11, inspection_name: 'Hydraulic Pressure Test', batch_number: 'HYD-2024-031', inspection_type: 'Pressure Test', inspector_name: 'John Smith', status: 'in_progress', quality_score: null, parameters: { max_pressure: '3000psi', cycle_count: 1000 } },
      { product_id: 12, inspection_name: 'Insulator HiPot Test', batch_number: 'INS-2024-009', inspection_type: 'Electrical Test', inspector_name: 'Sarah Johnson', status: 'passed', quality_score: 100, parameters: { test_voltage: '10kV', leakage: '<1mA' } },
      { product_id: 13, inspection_name: 'Actuator Function Test', batch_number: 'ACT-2024-017', inspection_type: 'Functional Test', inspector_name: 'Mike Chen', status: 'pending', quality_score: null, parameters: { stroke: '100mm', force: '500N' } },
      { product_id: 14, inspection_name: 'Harness Continuity Test', batch_number: 'WH-2024-025', inspection_type: 'Electrical Test', inspector_name: 'Emily Davis', status: 'passed', quality_score: 97, parameters: { resistance: '<0.1ohm', insulation: '>100Mohm' } },
      { product_id: 15, inspection_name: 'Fastener Torque Audit', batch_number: 'FST-2024-012', inspection_type: 'Torque Verification', inspector_name: 'Robert Wilson', status: 'passed', quality_score: 99, parameters: { torque_spec: '25Nm±10%', all_pass: true } }
    ]);
    console.log(`${qualityInspections.length} quality inspections created`);

    // Create Packaging Optimizations (15 items)
    const packagingOptimizations = await PackagingOptimization.bulkCreate([
      { product_id: 1, optimization_name: 'PCB ESD Packaging', current_packaging: 'Standard antistatic bag', product_dimensions: { length: 20, width: 15, height: 2 }, product_weight: 0.15, fragility_level: 'high', shipping_requirements: 'ESD protection required', optimization_goals: ['Cost reduction', 'Better protection'] },
      { product_id: 2, optimization_name: 'Bearing Protective Pack', current_packaging: 'Oil paper wrap', product_dimensions: { length: 10, width: 10, height: 5 }, product_weight: 0.8, fragility_level: 'medium', shipping_requirements: 'Prevent corrosion', optimization_goals: ['Moisture barrier', 'Cost effective'] },
      { product_id: 3, optimization_name: 'Display Panel Safe Ship', current_packaging: 'Foam corner protectors', product_dimensions: { length: 60, width: 40, height: 5 }, product_weight: 3.5, fragility_level: 'very_high', shipping_requirements: 'No pressure on screen', optimization_goals: ['Zero damage', 'Stackable'] },
      { product_id: 4, optimization_name: 'Heat Sink Bulk Pack', current_packaging: 'Individual boxes', product_dimensions: { length: 15, width: 10, height: 8 }, product_weight: 0.4, fragility_level: 'low', shipping_requirements: 'Standard', optimization_goals: ['Reduce packaging', 'Bulk efficiency'] },
      { product_id: 5, optimization_name: 'Gear Set Protection', current_packaging: 'Plastic tray', product_dimensions: { length: 8, width: 8, height: 4 }, product_weight: 0.3, fragility_level: 'medium', shipping_requirements: 'Prevent contact damage', optimization_goals: ['Better separation', 'Reusable'] },
      { product_id: 6, optimization_name: 'Sensor Cleanroom Pack', current_packaging: 'Sealed bag', product_dimensions: { length: 5, width: 3, height: 2 }, product_weight: 0.05, fragility_level: 'high', shipping_requirements: 'Clean environment', optimization_goals: ['Contamination free', 'Easy open'] },
      { product_id: 7, optimization_name: 'Gasket Flat Pack', current_packaging: 'Bulk bag', product_dimensions: { length: 30, width: 30, height: 0.5 }, product_weight: 0.1, fragility_level: 'low', shipping_requirements: 'Keep flat', optimization_goals: ['Space efficient', 'Easy count'] },
      { product_id: 8, optimization_name: 'Valve Heavy Duty Pack', current_packaging: 'Wooden crate', product_dimensions: { length: 25, width: 15, height: 20 }, product_weight: 5.0, fragility_level: 'medium', shipping_requirements: 'Handle with care', optimization_goals: ['Weight reduction', 'Recyclable'] },
      { product_id: 9, optimization_name: 'PSU Retail Pack', current_packaging: 'Retail box', product_dimensions: { length: 20, width: 15, height: 10 }, product_weight: 2.0, fragility_level: 'medium', shipping_requirements: 'Brand presentation', optimization_goals: ['Shelf appeal', 'Unboxing experience'] },
      { product_id: 10, optimization_name: 'Carbon Panel Flat Ship', current_packaging: 'Horizontal crate', product_dimensions: { length: 100, width: 50, height: 3 }, product_weight: 2.5, fragility_level: 'high', shipping_requirements: 'No bending', optimization_goals: ['Edge protection', 'Vertical storage'] },
      { product_id: 11, optimization_name: 'Hydraulic Cylinder Pack', current_packaging: 'Steel drum', product_dimensions: { length: 50, width: 15, height: 15 }, product_weight: 15.0, fragility_level: 'low', shipping_requirements: 'Weatherproof', optimization_goals: ['Lighter container', 'Stackable'] },
      { product_id: 12, optimization_name: 'Insulator Shock Pack', current_packaging: 'Molded foam', product_dimensions: { length: 20, width: 10, height: 10 }, product_weight: 0.8, fragility_level: 'very_high', shipping_requirements: 'No shock or vibration', optimization_goals: ['Impact resistant', 'Visible damage indicator'] },
      { product_id: 13, optimization_name: 'Actuator Industrial Pack', current_packaging: 'Cardboard box', product_dimensions: { length: 30, width: 10, height: 10 }, product_weight: 3.0, fragility_level: 'medium', shipping_requirements: 'Oil resistant', optimization_goals: ['Better cushioning', 'Reusable'] },
      { product_id: 14, optimization_name: 'Harness Coil Pack', current_packaging: 'Coiled in bag', product_dimensions: { length: 40, width: 40, height: 10 }, product_weight: 1.5, fragility_level: 'low', shipping_requirements: 'No kinking', optimization_goals: ['Easy deploy', 'Tangle free'] },
      { product_id: 15, optimization_name: 'Fastener Kit Pack', current_packaging: 'Compartment box', product_dimensions: { length: 15, width: 10, height: 5 }, product_weight: 0.5, fragility_level: 'low', shipping_requirements: 'Keep sorted', optimization_goals: ['Clear labeling', 'Inventory friendly'] }
    ]);
    console.log(`${packagingOptimizations.length} packaging optimizations created`);

    // Create AI Reports (15 items)
    const aiReports = await AIReport.bulkCreate([
      { product_id: 1, report_name: 'PCB Quality Summary Q1 2024', report_type: 'quality_summary', report_scope: 'Comprehensive quality analysis for Industrial Circuit Board A1 production line', include_data: { inspections: true, defects: true, trends: true }, executive_summary: { overview: 'PCB production line maintains high quality standards with 95% pass rate', key_findings: ['Solder quality improved 12% over quarter', 'Component placement accuracy at 99.8%'], overall_score: 92 }, sections: [{ title: 'Production Overview', content: 'Q1 saw 2,400 units produced with 95% first-pass yield' }, { title: 'Defect Analysis', content: 'Cold solder joints decreased from 2.1% to 1.2%' }], recommendations: [{ priority: 'medium', action: 'Upgrade reflow oven temperature profiling', expected_impact: '0.5% yield improvement' }] },
      { product_id: 2, report_name: 'Bearing Assembly Defect Analysis', report_type: 'defect_analysis', report_scope: 'Analysis of defect patterns in Steel Bearing Assembly production', include_data: { defects: true, classifications: true, root_causes: true }, executive_summary: { overview: 'Bearing assemblies show excellent quality with minor cosmetic issues', key_findings: ['Surface scratches account for 80% of reported defects', 'All functional metrics within tolerance'], overall_score: 97 }, sections: [{ title: 'Defect Distribution', content: '85% cosmetic, 10% dimensional, 5% material' }, { title: 'Root Cause Summary', content: 'Handling procedures identified as primary cause of cosmetic defects' }], recommendations: [{ priority: 'low', action: 'Implement protective handling trays', expected_impact: 'Reduce cosmetic defects by 60%' }] },
      { product_id: 3, report_name: 'Display Panel Inspection Report', report_type: 'inspection_report', report_scope: 'Detailed inspection results for LED Display Panel production batch DSP-2024-008', include_data: { inspections: true, defects: true, severity: true }, executive_summary: { overview: 'Display panel batch shows concerning dead pixel rate requiring corrective action', key_findings: ['Dead pixel clusters detected in 18% of units', 'Brightness uniformity below target'], overall_score: 72 }, sections: [{ title: 'Pixel Analysis', content: '5 units with dead pixel clusters exceeding acceptance criteria' }, { title: 'Brightness Testing', content: 'Average brightness 95% of spec, with 3% variation across panel' }], recommendations: [{ priority: 'high', action: 'Investigate TFT transistor supplier quality', expected_impact: 'Target dead pixel rate below 2%' }] },
      { product_id: 4, report_name: 'Heat Sink Thermal Trend Report', report_type: 'trend_report', report_scope: 'Performance trends for Aluminum Heat Sink thermal efficiency over 6 months', include_data: { trends: true, quality_inspections: true }, executive_summary: { overview: 'Heat sink thermal performance remains excellent and stable', key_findings: ['Thermal resistance consistently below 0.5 C/W', 'Surface finish quality improving'], overall_score: 96 }, sections: [{ title: 'Thermal Performance Trends', content: 'Stable thermal resistance averaging 0.45 C/W across all batches' }, { title: 'Manufacturing Consistency', content: 'Surface flatness improved from 0.025mm to 0.018mm' }], recommendations: [{ priority: 'low', action: 'Continue current manufacturing process', expected_impact: 'Maintain industry-leading thermal performance' }] },
      { product_id: 5, report_name: 'Gear Set Compliance Report', report_type: 'compliance_report', report_scope: 'ISO 1328 compliance assessment for Precision Gear Set manufacturing', include_data: { inspections: true, quality_inspections: true, defects: true }, executive_summary: { overview: 'Gear sets meet ISO 1328 Grade 6 requirements with minor observations', key_findings: ['Backlash within Grade 6 tolerance', 'Tooth wear pattern noted on 3 samples'], overall_score: 85 }, sections: [{ title: 'Dimensional Compliance', content: 'All critical dimensions within ISO 1328 Grade 6 limits' }, { title: 'Surface Quality', content: 'Tooth surface roughness Ra 0.4μm meets specification' }], recommendations: [{ priority: 'medium', action: 'Monitor gear tooth wear with increased sampling', expected_impact: 'Early detection of material hardness issues' }] },
      { product_id: 6, report_name: 'Optical Sensor Executive Summary', report_type: 'executive_summary', report_scope: 'Executive overview of Optical Sensor Module quality and production metrics', include_data: { inspections: true, trends: true, quality_inspections: true }, executive_summary: { overview: 'Sensor modules demonstrate industry-leading accuracy and reliability', key_findings: ['Calibration accuracy at 99.5%', 'Zero critical defects in Q1', 'Yield rate at 98.7%'], overall_score: 99 }, sections: [{ title: 'Key Metrics', content: 'Production: 5,000 units, Yield: 98.7%, Customer returns: 0.01%' }, { title: 'Quality Highlights', content: 'Achieved Six Sigma quality level for third consecutive quarter' }], recommendations: [{ priority: 'low', action: 'Document best practices for other product lines', expected_impact: 'Cross-pollinate quality improvements' }] },
      { product_id: 7, report_name: 'Gasket Kit Quality Summary', report_type: 'quality_summary', report_scope: 'Quality performance summary for Rubber Gasket Kit production', include_data: { inspections: true, quality_inspections: true }, executive_summary: { overview: 'Gasket production maintains consistent quality with reliable sealing performance', key_findings: ['Pressure test pass rate at 97%', 'Material consistency improved with new supplier'], overall_score: 94 }, sections: [{ title: 'Seal Performance', content: 'Average burst pressure 180% of rated capacity' }, { title: 'Material Quality', content: 'Shore A hardness within ±2 of specification across all batches' }], recommendations: [{ priority: 'medium', action: 'Standardize on new rubber compound supplier', expected_impact: 'Reduce material variability by 30%' }] },
      { product_id: 8, report_name: 'Valve Assembly Defect Analysis', report_type: 'defect_analysis', report_scope: 'Comprehensive defect analysis for Stainless Steel Valve production', include_data: { defects: true, classifications: true, severity: true }, executive_summary: { overview: 'Valve assemblies show exceptional quality with minimal defect occurrence', key_findings: ['Leak test pass rate at 99.9%', 'Minor surface corrosion in 2% of units'], overall_score: 98 }, sections: [{ title: 'Defect Categories', content: '60% cosmetic surface issues, 25% dimensional, 15% other' }, { title: 'Corrective Actions', content: 'Improved passivation process implemented for surface treatment' }], recommendations: [{ priority: 'low', action: 'Enhance humidity control in storage area', expected_impact: 'Eliminate surface oxidation issues' }] },
      { product_id: 9, report_name: 'PSU Failure Trend Report', report_type: 'trend_report', report_scope: 'Failure rate trend analysis for Power Supply Unit 500W over last 2 quarters', include_data: { defects: true, trends: true, root_causes: true }, executive_summary: { overview: 'PSU failure rate showing concerning upward trend requiring immediate attention', key_findings: ['Failure rate increased from 1.2% to 2.1% over Q1', 'Capacitor degradation identified as primary cause', 'Thermal management needs improvement'], overall_score: 68 }, sections: [{ title: 'Failure Trend', content: 'Month-over-month increase of 0.3% in failure rate' }, { title: 'Component Analysis', content: 'Electrolytic capacitors showing early degradation under thermal stress' }], recommendations: [{ priority: 'critical', action: 'Replace capacitor supplier and improve thermal design', expected_impact: 'Target failure rate below 1% within 60 days' }] },
      { product_id: 10, report_name: 'Carbon Fiber Panel Inspection Report', report_type: 'inspection_report', report_scope: 'Structural integrity inspection report for Carbon Fiber Panel batch CF-2024-006', include_data: { inspections: true, defects: true, quality_inspections: true }, executive_summary: { overview: 'Carbon fiber panels pass NDT inspection with one delamination finding', key_findings: ['Ultrasonic inspection passed on 14/15 panels', 'Edge delamination found on 1 panel', 'Tensile strength within specification'], overall_score: 88 }, sections: [{ title: 'NDT Results', content: 'Ultrasonic C-scan clear on 93% of panels. One panel showed edge void.' }, { title: 'Mechanical Testing', content: 'Tensile: 98.5% of nominal, Flexural: 99.2% of nominal' }], recommendations: [{ priority: 'high', action: 'Review autoclave cure cycle parameters', expected_impact: 'Eliminate edge delamination defects' }] },
      { product_id: 11, report_name: 'Hydraulic Cylinder Compliance Report', report_type: 'compliance_report', report_scope: 'ISO 6020/6022 compliance assessment for Hydraulic Cylinder assembly', include_data: { inspections: true, quality_inspections: true, severity: true }, executive_summary: { overview: 'Hydraulic cylinders meet ISO standards with seal wear observation noted', key_findings: ['Pressure rating verified at 3000psi', 'Seal wear detected at 800 cycles vs 1000 cycle target', 'Dimensional compliance confirmed'], overall_score: 87 }, sections: [{ title: 'Pressure Testing', content: 'All units held 3000psi for 10 minutes without leakage' }, { title: 'Seal Assessment', content: 'Piston seals showing wear marks earlier than expected' }], recommendations: [{ priority: 'high', action: 'Evaluate alternative seal material compounds', expected_impact: 'Extend seal life to 1500+ cycles' }] },
      { product_id: 12, report_name: 'Ceramic Insulator Quality Summary', report_type: 'quality_summary', report_scope: 'Quality summary for Ceramic Insulator production including dielectric testing', include_data: { inspections: true, defects: true, quality_inspections: true }, executive_summary: { overview: 'Insulator quality is excellent but hairline crack finding requires investigation', key_findings: ['Dielectric strength at 100% of specification', 'One hairline crack detected during visual inspection', 'HiPot test pass rate at 100%'], overall_score: 91 }, sections: [{ title: 'Electrical Performance', content: 'Dielectric withstand voltage exceeds 10kV with leakage below 1mA' }, { title: 'Structural Integrity', content: 'Micro-crack detected in one unit during 10x magnification inspection' }], recommendations: [{ priority: 'high', action: 'Implement 100% ultrasonic screening for hairline cracks', expected_impact: 'Zero escape rate for structural defects' }] },
      { product_id: 13, report_name: 'Pneumatic Actuator Executive Summary', report_type: 'executive_summary', report_scope: 'Executive overview of Pneumatic Actuator manufacturing quality and delivery performance', include_data: { inspections: true, trends: true }, executive_summary: { overview: 'Actuator production meeting quality targets with improving response times', key_findings: ['Response time improved 15% over quarter', 'On-time delivery at 96%', 'Customer satisfaction score: 4.6/5'], overall_score: 93 }, sections: [{ title: 'Performance Metrics', content: 'Average response time reduced from 45ms to 38ms' }, { title: 'Delivery Performance', content: '96% on-time delivery with 0% quality escapes to customer' }], recommendations: [{ priority: 'low', action: 'Investigate further response time optimization', expected_impact: 'Sub-35ms response time achievable' }] },
      { product_id: 14, report_name: 'Wiring Harness Defect Analysis', report_type: 'defect_analysis', report_scope: 'Analysis of insulation damage and continuity defects in Copper Wiring Harness production', include_data: { defects: true, root_causes: true, classifications: true }, executive_summary: { overview: 'Wiring harness quality is high with minor insulation abrasion issue identified', key_findings: ['Continuity test pass rate at 99.7%', 'Insulation damage at connector junctions in 1.5% of units', 'Root cause: sharp edge contact during routing'], overall_score: 95 }, sections: [{ title: 'Defect Analysis', content: 'Primary defect: insulation abrasion at routing bend points' }, { title: 'Process Improvement', content: 'Edge protection grommets being added to routing channels' }], recommendations: [{ priority: 'medium', action: 'Install edge protection at all routing bend points', expected_impact: 'Eliminate insulation abrasion defects' }] },
      { product_id: 15, report_name: 'Titanium Fastener Trend Report', report_type: 'trend_report', report_scope: 'Quality and consistency trend analysis for Titanium Fastener Set production', include_data: { trends: true, quality_inspections: true, inspections: true }, executive_summary: { overview: 'Fastener production demonstrates excellent consistency and aerospace-grade quality', key_findings: ['Torque consistency at 98.5% across all batches', 'Thread quality improved with new CNC tooling', 'Zero critical defects in 12 months'], overall_score: 99 }, sections: [{ title: 'Quality Trends', content: 'Consistent upward trend in quality scores from 97 to 99 over 4 quarters' }, { title: 'Process Capability', content: 'Cpk index of 2.1 for critical thread dimensions' }], recommendations: [{ priority: 'low', action: 'Maintain current quality processes', expected_impact: 'Sustain aerospace-grade quality certification' }] }
    ]);
    console.log(`${aiReports.length} AI reports created`);

    // Create sample reports (15 items)
    const reports = await InspectionReport.bulkCreate([
      { inspection_id: 1, report_data: { inspection_id: 1, product: { id: 1, name: 'Industrial Circuit Board A1', sku: 'PCB-001' }, status: 'completed', quality_score: 92, generated_at: new Date().toISOString() } },
      { inspection_id: 2, report_data: { inspection_id: 2, product: { id: 2, name: 'Steel Bearing Assembly', sku: 'MEC-002' }, status: 'completed', quality_score: 97, generated_at: new Date().toISOString() } },
      { inspection_id: 3, report_data: { inspection_id: 3, product: { id: 3, name: 'LED Display Panel 24"', sku: 'DSP-003' }, status: 'failed', quality_score: 75, generated_at: new Date().toISOString() } },
      { inspection_id: 4, report_data: { inspection_id: 4, product: { id: 4, name: 'Aluminum Heat Sink', sku: 'THR-004' }, status: 'completed', quality_score: 96, generated_at: new Date().toISOString() } },
      { inspection_id: 6, report_data: { inspection_id: 6, product: { id: 6, name: 'Optical Sensor Module', sku: 'SEN-006' }, status: 'completed', quality_score: 94, generated_at: new Date().toISOString() } },
      { inspection_id: 8, report_data: { inspection_id: 8, product: { id: 8, name: 'Stainless Steel Valve', sku: 'FLW-008' }, status: 'completed', quality_score: 98, generated_at: new Date().toISOString() } },
      { inspection_id: 9, report_data: { inspection_id: 9, product: { id: 9, name: 'Power Supply Unit 500W', sku: 'PWR-009' }, status: 'failed', quality_score: 68, generated_at: new Date().toISOString() } },
      { inspection_id: 10, report_data: { inspection_id: 10, product: { id: 10, name: 'Carbon Fiber Panel', sku: 'MAT-010' }, status: 'completed', quality_score: 88, generated_at: new Date().toISOString() } },
      { inspection_id: 12, report_data: { inspection_id: 12, product: { id: 12, name: 'Ceramic Insulator', sku: 'INS-012' }, status: 'completed', quality_score: 91, generated_at: new Date().toISOString() } },
      { inspection_id: 14, report_data: { inspection_id: 14, product: { id: 14, name: 'Copper Wiring Harness', sku: 'WIR-014' }, status: 'completed', quality_score: 95, generated_at: new Date().toISOString() } },
      { inspection_id: 15, report_data: { inspection_id: 15, product: { id: 15, name: 'Titanium Fastener Set', sku: 'FAS-015' }, status: 'completed', quality_score: 99, generated_at: new Date().toISOString() } },
      { inspection_id: 17, report_data: { inspection_id: 17, product: { id: 17, name: 'Motor Controller Board', sku: 'CTL-017' }, status: 'failed', quality_score: 72, generated_at: new Date().toISOString() } },
      { inspection_id: 18, report_data: { inspection_id: 18, product: { id: 18, name: 'Polymer Bushing Set', sku: 'BUS-018' }, status: 'completed', quality_score: 93, generated_at: new Date().toISOString() } },
      { inspection_id: 5, report_data: { inspection_id: 5, product: { id: 5, name: 'Precision Gear Set', sku: 'MEC-005' }, status: 'in_progress', quality_score: 85, generated_at: new Date().toISOString() } },
      { inspection_id: 11, report_data: { inspection_id: 11, product: { id: 11, name: 'Hydraulic Cylinder', sku: 'HYD-011' }, status: 'in_progress', quality_score: 87, generated_at: new Date().toISOString() } }
    ]);
    console.log(`${reports.length} reports created`);

    console.log('\n========================================');
    console.log('Database seeding completed successfully!');
    console.log('========================================');
    console.log('\nSeed Summary:');
    console.log(`  - Products: ${products.length}`);
    console.log(`  - Inspections: ${inspections.length}`);
    console.log(`  - Defects: ${defects.length}`);
    console.log(`  - Defect Classifications: ${classifications.length}`);
    console.log(`  - Severity Scores: ${severityScores.length}`);
    console.log(`  - Root Cause Analyses: ${rootCauses.length}`);
    console.log(`  - Trend Analyses: ${trends.length}`);
    console.log(`  - Quality Inspections: ${qualityInspections.length}`);
    console.log(`  - Packaging Optimizations: ${packagingOptimizations.length}`);
    console.log(`  - AI Reports: ${aiReports.length}`);
    console.log(`  - Reports: ${reports.length}`);
    console.log('\nDemo credentials: demo@example.com / password123');

    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
};

seedData();
