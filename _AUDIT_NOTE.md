# Audit Recommendations & Status — AIVisualQAInspector

Source: /Users/erolakarsu/projects/_AUDIT/reports/batch_08.md (section 33)

Verdict per audit: partial-build, 3 AI endpoints (sparse) despite the rich domain.

## Original audit recommendations

Missing AI counterparts:
- Computer vision for defect detection (note: existing `/analyze` already does vision)
- Predictive quality scoring

Missing non-AI:
- Production-line camera integration
- Real-time SPC (Statistical Process Control)
- ERP integration for rework/scrap
- Supplier quality management

Custom feature ideas:
- Computer vision defect detector (largely covered by existing `/analyze`)
- Predictive quality scoring
- Root cause correlation
- Supplier quality tracking
- Quality improvement recommendation

## Implemented in this pass (MECHANICAL)

Added two new text-only endpoints to existing `backend/routes/ai.js` (CommonJS, matches existing style and uses the service singleton's `makeRequest` helper).

- `POST /api/ai/predictive-quality` — predict whether the next run exceeds defect threshold and recommend parameter adjustments.
- `POST /api/ai/improvement-recommendations` — Six-Sigma-style improvement plan with quick wins / longer-term initiatives.

## Backlog

1. Production-line camera integration — requires camera SDKs/credentials.
2. Real-time SPC engine — substantial domain feature.
3. ERP / supplier integrations — credentials decision.
4. Supplier quality scoring — could be an AI text endpoint over historical data; mechanical add-on.
5. Defect-vs-parameter correlation — better suited as a stats endpoint, deferred.

## Apply pass 3 (frontend)

Both pass-2 endpoints have dedicated FE pages already in place:
- `frontend/src/components/PredictiveQuality/PredictiveQualityPage.jsx` posts
  to `/api/ai/predictive-quality`.
- `frontend/src/components/ImprovementRecommendations/ImprovementRecommendationsPage.jsx`
  posts to `/api/ai/improvement-recommendations`.

`App.jsx` routes both at `/predictive-quality` and `/improvement-recommendations`.
Backend `routes/ai.js` registered with `auth` and `aiRateLimiter` middleware in
`server.js`. **Action: LEFT-AS-IS — FE already wired.**

## Apply pass 4 (mechanical backlog)

Added the MECHANICAL backlog item Supplier Quality Scoring. Reuses the existing
`openRouterService.makeRequest` singleton (CommonJS) and is registered under
the auth + aiRateLimiter chain via the existing `app.use('/api/ai', auth, aiRateLimiter, aiRoutes)`
mount. Route entry adds an explicit 503 when `OPENROUTER_API_KEY` is missing
or unset to match the spec.

Backend (`backend/routes/ai.js`):
- `POST /api/ai/supplier-quality-score` — input fields: supplierName, productCategory, lookbackDays, defectStats, onTimeDeliveryPct, reworkRatePct, certifications, auditFindings, historicalIncidents. Output: overallScore (0-100), grade A-F, tier, subscores breakdown, top risks/strengths, recommended actions, monitoring cadence, summary.

Frontend:
- `components/SupplierQualityScore/SupplierQualityScorePage.jsx` — form (with Load Sample button) and 503 error handling. Uses raw `axios.post('/api/ai/...')` to match the existing PredictiveQuality / ImprovementRecommendations pages (session-cookie auth via the shared frontend dev proxy).
- `App.jsx` — added `/supplier-quality-score` route gated on user.
- `components/common/Sidebar.jsx` — added Supplier Quality entry under the AI Features section.

Items intentionally left in backlog: production-line camera SDK integration (NEEDS-CREDS), real-time SPC engine (substantive new domain feature), ERP/supplier system integrations (NEEDS-CREDS), defect-vs-parameter statistical correlation (better as stats endpoint).

## Apply pass 5 (all backlog)

Closed the two MECHANICAL items previously listed in backlog
(defect-vs-parameter correlation; SPC control chart engine — shipped as a
synchronous REST batch).

Backend (`backend/routes/ai.js`):
- `POST /api/ai/defect-parameter-correlation` — MECHANICAL. Correlates
  defect series ↔ process parameter series and returns top correlations,
  candidate root causes, and recommended experiments.
- `POST /api/ai/spc-control-chart` — MECHANICAL with PRODUCT-DECISION
  subset. Computes Shewhart X-bar / R limits for n in [2..10] using A2
  / D3 / D4 constants, detects out-of-control points (Western Electric
  Rule 1), then asks AI to interpret signals/trends. PRODUCT-DECISION:
  shipped as synchronous batch, not real-time streaming.

Both endpoints return 503 with `missing: OPENROUTER_API_KEY` when the
env var is unset; env vars are documented in code comments.

Frontend:
- `components/DefectParameterCorrelation/DefectParameterCorrelationPage.jsx`
- `components/SPCControlChart/SPCControlChartPage.jsx`
- `App.jsx` — two new routes (`/defect-parameter-correlation`,
  `/spc-control-chart`).
- `components/common/Sidebar.jsx` — two new entries under AI Features.

Smoke test: backend on port 4804, `/api/health` 200, login
(demo@example.com / password123) 200, both endpoints reachable through
the auth + rate-limit chain. `node --check` passes on `routes/ai.js`.

Items still backlog: production-line camera SDK (NEEDS-CREDS),
streaming SPC UI (substantive new feature), ERP/supplier system
integrations (NEEDS-CREDS).
