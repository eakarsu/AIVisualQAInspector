# Visual QA Inspector operations

## Supported boundary

The governed path covers tenant/site/line/camera permissions, versioned product specifications and inspection rules, timestamped deduplicated frame evidence, findings, independent QA and line-safety review, execution receipts, reconciliation, and manual recovery. Production-camera, MES, ERP, QMS, SCADA/PLC, supplier, maintenance, notification, and webhook names are typed adapter contracts—not claims that production systems are connected.

The system does not autonomously stop a line, scrap product, or release a batch. Generated feature routes are disabled by default and cannot be enabled in production.

## Deploy and run

Install dependencies explicitly in `backend/` and `frontend/`. Configure `.env` from `.env.example` with `DATABASE_URL`, a deployment-unique `GOVERNANCE_TENANT_ID`, and a random `JWT_SECRET` of at least 32 characters. Store camera and plant credentials in a secret manager and pass only secret references.

Use `./start.sh check`; after SQL review and backup use `ALLOW_SCHEMA_MIGRATION=1 ./start.sh migrate`; then use `./start.sh start`. Startup performs neither model synchronization nor schema alteration and stops only child processes it owns.

## Workflow and recovery

Create a subject-scoped inspection at `/api/governance` with provenance and a unique `Idempotency-Key`, submit its current version, and obtain a decision from a different authorized reviewer. Connector checkpoints preserve source version, capture time, counts, and bounded errors. Outbox workers claim with leases and persist typed provider receipts. On stale/duplicate frames, specification mismatch, camera outage, delayed MES feedback, or ambiguous delivery, stop consequential action, reconcile evidence, and retry the same idempotent item or move it to manual recovery.

Acceptance fixtures measure false-accept/false-reject rate, latency, missed events, and realized outcomes. Run `node --test backend/governance/tests/*.test.js` and `bash -n start.sh`. Destructive demo fixtures require explicit opt-in and environment-supplied credentials on a disposable database.
