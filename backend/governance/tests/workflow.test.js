const test = require('node:test');
const assert = require('node:assert/strict');
const { evaluate } = require('../domain');

function fixture() {
  return {
  productionLine:{id:'line1',tenantId:'t1',sitePermissionVersion:'sp1',cameraPermissionVersion:'cp1',safetyPolicyVersion:'safe1',retentionDays:30},
  products:[{id:'prod1',batchId:'batch1',specificationVersion:'spec1',acceptanceRuleVersion:'rule1',provenanceRef:'qms:1'}],
  frames:[{id:'frame1',productId:'prod1',cameraId:'cam1',capturedAt:'2026-07-18T00:00:00Z',receivedAt:'2026-07-18T00:00:01Z',sourceVersion:'cam-v1',sha256:'a'.repeat(64),duplicate:false,stale:false}],
  inspectionJob:{id:'job1',ownerId:'owner',specificationVersion:'spec1',status:'approved'},
  findings:[{id:'finding1',frameId:'frame1',ruleVersion:'rule1',region:{x:1,y:1},score:0.92,thresholdVersion:'th1',explanation:'surface anomaly'}],
  decision:{id:'d1',jobId:'job1',findingIds:['finding1'],uncertaintyNote:'sample review',autonomousLineStop:false,qaApproved:true,approvedBy:'reviewer',safetyChecksPassed:true},
  execution:{status:'receipt_recorded',feedbackAt:'2026-07-18T00:00:02Z',receiptRef:'qms:receipt:1'},
  validation:{fixtureVersion:'f1',falseAcceptRate:0.01,falseRejectRate:0.02,latencyMs:100,missedEvents:0,realizedOutcomeRecorded:true,reconciled:true},
  fixtures:{cameraOffline:true,duplicateFrame:true,specChange:true,falsePositive:true,mesDivergence:true,recovery:true}
};
}

test('accepts governed visual QA inspection', () => {
  const result = evaluate(fixture(), { tenant: 't1', actor: 'owner' });
  assert.deepEqual(result.errors, []);
});

test('blocks unsafe or ungoverned visual QA inspection', () => {
  const input = fixture();
  input.decision.autonomousLineStop = true;
  assert.ok(evaluate(input, { tenant: 't1', actor: 'owner' }).errors.length > 0);
  assert.ok(evaluate(fixture(), { tenant: 'other', actor: 'owner' }).errors.length > 0);
});
