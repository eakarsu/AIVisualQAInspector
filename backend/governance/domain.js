'use strict';
function evaluate(input = {}, context = {}) {
  const errors = [];
  const line = input.productionLine || {};
  const products = input.products || [];
  const frames = input.frames || [];
  const job = input.inspectionJob || {};
  const findings = input.findings || [];
  const decision = input.decision || {};
  const execution = input.execution || {};
  const validation = input.validation || {};
  if (!line.id || !line.tenantId || line.tenantId !== context.tenant || !line.sitePermissionVersion || !line.cameraPermissionVersion
      || !line.safetyPolicyVersion || !line.retentionDays) errors.push('scoped production line and camera permission required');
  const productIds = new Set();
  for (const product of products) {
    if (!product.id || productIds.has(String(product.id)) || !product.batchId || !product.specificationVersion
        || !product.acceptanceRuleVersion || !product.provenanceRef) errors.push('versioned product specification invalid');
    productIds.add(String(product.id));
  }
  const frameIds = new Set();
  for (const frame of frames) {
    if (!frame.id || frameIds.has(String(frame.id)) || !productIds.has(String(frame.productId)) || !frame.cameraId
        || !frame.capturedAt || !frame.receivedAt || !frame.sourceVersion || !frame.sha256 || frame.duplicate || frame.stale) errors.push('authoritative camera frame invalid');
    frameIds.add(String(frame.id));
  }
  if (!job.id || !job.ownerId || job.ownerId !== context.actor || !job.specificationVersion || !['planned','capturing','review','approved','rejected','completed','failed','recovery'].includes(job.status)) errors.push('inspection job state invalid');
  for (const finding of findings) {
    if (!finding.id || !frameIds.has(String(finding.frameId)) || !finding.ruleVersion || !finding.region
        || !Number.isFinite(finding.score) || !finding.thresholdVersion || !finding.explanation) errors.push('source-linked defect finding invalid');
  }
  if (!decision.id || decision.jobId !== job.id || !decision.findingIds || !decision.uncertaintyNote
      || decision.autonomousLineStop || decision.qaApproved !== true || !decision.approvedBy
      || decision.approvedBy === job.ownerId || decision.safetyChecksPassed !== true) errors.push('independent QA disposition required');
  if (!['queued','receipt_recorded','failed','recovery'].includes(execution.status) || !execution.feedbackAt
      || (execution.status === 'receipt_recorded' && !execution.receiptRef)) errors.push('MES/QMS receipt or recovery invalid');
  for (const key of ['fixtureVersion','falseAcceptRate','falseRejectRate','latencyMs','missedEvents','realizedOutcomeRecorded','reconciled']) {
    if (validation[key] === undefined) errors.push(`validation ${key} required`);
  }
  for (const key of ['cameraOffline','duplicateFrame','specChange','falsePositive','mesDivergence','recovery']) {
    if (input.fixtures?.[key] !== true) errors.push(`fixture ${key} required`);
  }
  return { errors, result: { jobId: job.id, findingCount: findings.length, disposition: errors.length ? 'manual-review' : 'qa-reviewed' },
    assumptions: ['No line stop, scrap, or release is automatic'],
    uncertainty: { productionCamerasConnected: false, qaReviewRequired: true } };
}
module.exports = { evaluate };
