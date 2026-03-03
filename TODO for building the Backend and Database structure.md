# TODO.md - Backend & Database Plan for Modkharat-App (Node.js + Express + Supabase PostgreSQL)

## Summary
- [ ] Build a new `backend` service that becomes the single API layer for the existing Expo app.
- [ ] Use Supabase for PostgreSQL, Auth, and Storage; use Express for business logic, RBAC, integrations, and API contracts.
- [ ] Implement async ingestion pipelines for OCR and Voice, plus SMS parsing and SMS sending.
- [ ] Design a production-safe schema for auth, transactions, budgets, goals, family roles/permissions, notifications, and ingestion jobs.
- [ ] Ship with tests, CI/CD, observability, and security controls from day one.

## Current Baseline (Repo Analysis)
- [ ] Frontend is Expo React Native (`modkharat-mobile`) and currently uses only mock data (no backend calls yet).
- [ ] Main modules already represented in UI: auth, transactions, analytics, budgets, goals, family, notifications, settings.
- [ ] Capture flows already designed in UI: `manual`, `sms`, `voice`, `scan` (receipt OCR).
- [ ] Core domain types already exist client-side (`Transaction`, `Budget`, `Goal`, `FamilyMember`, `NotificationItem`), so backend contracts should align to minimize frontend refactor.
- [ ] No backend folder or DB schema currently exists in repo.

## 1. Initial Project Setup & Configuration
- [ ] Create `backend/` with TypeScript + Express structure: `src/app.ts`, `src/server.ts`, `src/routes`, `src/controllers`, `src/services`, `src/repositories`, `src/middleware`, `src/lib`, `src/jobs`, `src/types`, `src/config`.
- [ ] Add runtime deps: `express`, `cors`, `helmet`, `zod`, `pino`, `pino-http`, `dotenv`, `pg`, `pg-boss`, `@supabase/supabase-js`, `jose`, `multer`, `@google-cloud/vision`, `@google-cloud/speech`, `twilio`.
- [ ] Add dev deps: `typescript`, `tsx`, `vitest`, `supertest`, `eslint`, `prettier`, `@types/*`, `nyc` or `c8`.
- [ ] Add scripts: `dev`, `build`, `start`, `test`, `test:integration`, `lint`, `typecheck`, `migrate`, `seed`, `worker`.
- [ ] Add config files: `.env.example`, `.env.development`, `tsconfig.json`, ESLint/Prettier, `vitest.config.ts`.
- [ ] Add API versioning and base path: `/v1`.
- [ ] Add health endpoints: `/health/live`, `/health/ready`.

## 2. Supabase + PostgreSQL Foundation
- [ ] Create Supabase project and connect backend with `DATABASE_URL`, `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`.
- [ ] Use Supabase Auth for user lifecycle and JWT issuance; backend verifies JWT via Supabase JWKS.
- [ ] Use Supabase Storage buckets: `receipts`, `voice-recordings`, `exports`.
- [ ] Add SQL migrations folder `backend/supabase/migrations`.
- [ ] Enable required extensions: `uuid-ossp` (or `pgcrypto`), `citext`, `pg_trgm` (optional for search).
- [ ] Enforce UTC timestamps everywhere (`timestamptz`), store user locale/timezone as profile preference.
- [ ] Enable RLS on all business tables and deny direct client access by default.

## 3. Public API / Interfaces / Types (Important Additions)
- [ ] Standardize response envelope: `{ data, meta?, error? }`.
- [ ] Standardize error shape: `{ code, message, details?, traceId }`.
- [ ] Define shared types for frontend-backend contracts:
- [ ] `AuthUser`, `UserProfile`, `Household`, `Membership`, `PermissionSet`.
- [ ] `TransactionCreateInput`, `TransactionUpdateInput`, `TransactionListQuery`.
- [ ] `BudgetCreateInput`, `BudgetProgress`, `BudgetComparisonPoint`.
- [ ] `GoalCreateInput`, `GoalContributionInput`, `GoalProjectionPoint`.
- [ ] `NotificationDTO`, `IngestionJobDTO`, `ApiPaginationMeta`.
- [ ] Keep capture method enum aligned with frontend: `manual | sms | voice | scan`.
- [ ] Add transaction status enum for ingestion review: `draft | confirmed | rejected`.
- [ ] Add ingestion job status enum: `queued | processing | completed | failed`.

## 4. Database Schema Design & Relationships
- [ ] Create `profiles` table keyed by `auth.users.id` for app-level user metadata.
- [ ] Create `households` table (family workspace owner context).
- [ ] Create `household_members` table with role and permission flags: `view_only`, `can_add_transactions`, `can_edit_budgets`, `can_manage_members`.
- [ ] Create `accounts` table for financial accounts per household.
- [ ] Create `categories` table with `is_system` and household scoping.
- [ ] Create `transactions` table with fields for amount, type, merchant, account, category, method, notes, occurrence date, status, receipt ref, created_by.
- [ ] Create `transaction_sources` table for raw capture payloads and parse confidence.
- [ ] Create `budgets` table with period (`monthly`, etc.), cap amount, category/account scope.
- [ ] Create `budget_snapshots` table for monthly planned vs actual history.
- [ ] Create `goals` table with target, current, target date, monthly contribution, icon, account.
- [ ] Create `goal_contributions` table linked to goals and optionally linked transaction IDs.
- [ ] Create `notifications` table with typed metadata JSON and read status.
- [ ] Create `family_invites` table for email/SMS invites with token and expiry.
- [ ] Create `ingestion_jobs` table to track OCR/voice/SMS parse pipelines and outputs.
- [ ] Create `sms_messages` table for raw bank SMS text, sender, parse output, and confidence.
- [ ] Create `audit_logs` table for sensitive actions (permission changes, account deletion, exports).
- [ ] Add indexes for high-frequency queries: `(household_id, occurred_at desc)`, `(household_id, category_id, period)`, `(user_id, read_at)`, `(status, created_at)`.
- [ ] Add unique/constraint rules for data integrity (e.g., one membership per user per household, non-negative budget limits, goal target > 0).

## 5. Auth, Authorization, and Middleware
- [ ] Build JWT auth middleware validating Supabase tokens with issuer/audience checks.
- [ ] Build request context middleware to resolve `userId`, active `householdId`, role, and permissions.
- [ ] Build strict RBAC guards matching family permission toggles in UI.
- [ ] Add middleware stack: `helmet`, CORS allowlist, JSON body size limits, request ID, pino logging, validation error normalizer.
- [ ] Add rate limiting and brute-force protection for auth-adjacent and ingestion routes.
- [ ] Add idempotency middleware for import and create endpoints to prevent duplicate transactions.
- [ ] Add centralized error handler with safe error messages and provider-failure classification.

## 6. Backend API Routes (Express)
- [ ] Implement `/v1/auth/me` (`GET`) and profile update (`PATCH`) for app identity hydration.
- [ ] Implement `/v1/households` (`POST`, `GET`) and active household switching endpoint.
- [ ] Implement `/v1/households/:id/members` (`GET`, `PATCH`, `DELETE`) with strict organizer/member permission enforcement.
- [ ] Implement `/v1/households/:id/invites` (`POST`) supporting `email` and `sms` channels.
- [ ] Implement `/v1/transactions` (`POST`, `GET`) with search, type filter, date range, category, account, pagination.
- [ ] Implement `/v1/transactions/:id` (`GET`, `PATCH`, `DELETE`).
- [ ] Implement `/v1/budgets` (`POST`, `GET`) and `/v1/budgets/:id` (`GET`, `PATCH`, `DELETE`).
- [ ] Implement `/v1/budgets/:id/transactions` and `/v1/budgets/:id/comparison`.
- [ ] Implement `/v1/goals` (`POST`, `GET`) and `/v1/goals/:id` (`GET`, `PATCH`, `DELETE`).
- [ ] Implement `/v1/goals/:id/contributions` (`POST`, `GET`) and projection endpoint.
- [ ] Implement `/v1/notifications` (`GET`) and `/v1/notifications/:id/read` (`PATCH`) plus `mark-all-read`.
- [ ] Implement `/v1/analytics/overview`, `/v1/analytics/spending-by-category`, `/v1/analytics/income-vs-expenses`.
- [ ] Implement `/v1/settings/export` (async data export job) and `/v1/settings/account` (`DELETE` with soft-delete workflow).

## 7. OCR Integration (Google Vision)
- [ ] Add endpoint `/v1/import/ocr` to accept receipt image upload and create ingestion job.
- [ ] Store image in Supabase Storage and record file metadata/hash for dedupe.
- [ ] Worker flow: fetch image -> call Vision OCR -> normalize text -> parse merchant/amount/date/currency -> create `draft` transaction.
- [ ] Persist raw OCR text and parser confidence to `transaction_sources`/`ingestion_jobs`.
- [ ] Return job ID immediately; frontend polls `/v1/import/jobs/:jobId`.
- [ ] Add fallback behavior for low-confidence results requiring manual review.

## 8. Voice Integration (Google Speech-to-Text)
- [ ] Add endpoint `/v1/import/voice` to upload audio or receive URI and enqueue transcription job.
- [ ] Use language hints for `ar-SA` and `en-US`; persist transcript and confidence.
- [ ] Parse transcript into transaction draft with deterministic extraction rules.
- [ ] Link generated draft to source transcript and ingestion job.
- [ ] Add timeout/retry policy and clear error mapping for failed transcriptions.

## 9. SMS Integration (Parse + Send via Twilio)
- [ ] Add endpoint `/v1/import/sms` to parse pasted bank SMS text into draft transaction.
- [ ] Add `sms_bank_patterns` seed/config to improve parsing accuracy by bank format.
- [ ] Store raw SMS, parser result, and confidence for audit/debug.
- [ ] Add outbound SMS service for family invites and optional critical alerts.
- [ ] Add webhook endpoint `/v1/webhooks/twilio/status` for delivery status tracking.
- [ ] Validate Twilio signatures and enforce webhook replay protection.

## 10. Async Job System
- [ ] Use `pg-boss` with Supabase Postgres for queueing (no extra Redis dependency).
- [ ] Run separate worker process (`backend worker`) for OCR/voice/SMS background jobs.
- [ ] Implement retries with exponential backoff and dead-letter handling.
- [ ] Track SLA metrics: queue delay, processing time, success/failure counts.

## 11. Testing Strategy
- [ ] Unit tests for validators, RBAC guards, amount/date parsers, SMS/OCR/voice extraction logic.
- [ ] Integration tests for all route groups with authenticated and unauthorized scenarios.
- [ ] DB integration tests on ephemeral PostgreSQL with migrations applied.
- [ ] Provider adapter tests with mocked Google/Twilio responses and timeout/failure cases.
- [ ] Contract tests for response shape consistency (`data/error/meta`) to protect frontend integration.
- [ ] Security tests for SQL injection vectors, JWT tampering, missing permission checks, and rate limiting.
- [ ] Performance tests for transaction list and analytics endpoints using realistic dataset volumes.

## 12. Deployment, CI/CD, and Operations
- [ ] Deploy API and worker as two Railway services from same repo.
- [ ] Keep Supabase as managed Postgres/Auth/Storage backend.
- [ ] Configure environments: `dev`, `staging`, `prod` with separate Supabase projects.
- [ ] CI pipeline: install -> lint -> typecheck -> tests -> build -> deploy staging -> approval gate -> deploy prod.
- [ ] Run migrations in CI/CD before app boot; block deploy on migration failure.
- [ ] Add observability: structured logs, request tracing, error monitoring (Sentry), uptime checks.
- [ ] Add runbooks for provider outage, DB incident, and failed job backlog recovery.

## 13. Security, Performance, and Error-Handling Checklist
- [ ] Never expose Supabase service role key to frontend or logs.
- [ ] Enforce strict input validation (Zod) on all request bodies/params/queries.
- [ ] Apply least privilege to DB/API credentials and rotate keys regularly.
- [ ] Use prepared statements only; no string-built SQL.
- [ ] Add pagination limits and default sort/index paths to avoid expensive scans.
- [ ] Cache selected analytics responses with short TTL where safe.
- [ ] Add transaction deduplication logic for repeated imports.
- [ ] Normalize all monetary values to `numeric(14,2)` and avoid float math.
- [ ] Use consistent timezone handling and date boundaries for monthly analytics.
- [ ] Ensure all unhandled errors return stable API error shape with trace ID.

## 14. Test Cases & Scenarios (Acceptance-Oriented)
- [ ] User signs up/signs in via Supabase Auth, then backend accepts JWT and returns `/auth/me`.
- [ ] Member without `can_edit_budgets` cannot update budget; organizer can.
- [ ] SMS parse creates draft transaction from realistic Saudi bank message format.
- [ ] OCR receipt import returns job ID, then job completes with parsed draft transaction.
- [ ] Voice import handles Arabic utterance and returns structured draft transaction.
- [ ] Duplicate import with same idempotency key does not create duplicate transaction rows.
- [ ] Analytics endpoints match transaction totals for seeded deterministic dataset.
- [ ] Family invite via Twilio SMS records sent status and webhook delivery update.
- [ ] Notification `mark-read` and `mark-all-read` update only current user records.
- [ ] Account deletion/export flows are auditable and permission-protected.

## 15. Assumptions and Defaults Chosen
- [ ] Authentication model: Supabase Auth (JWT verified by backend).
- [ ] Providers: Google Vision OCR + Google Speech-to-Text + Twilio SMS.
- [ ] Deployment: Railway for API/worker, Supabase for DB/Auth/Storage.
- [ ] SMS scope in v1: both parse bank SMS and send outbound SMS.
- [ ] Authorization model: strict backend-enforced RBAC aligned with family permissions in UI.
- [ ] OCR/Voice processing mode: async jobs with polling endpoint.
- [ ] Frontend will be updated after backend readiness to replace all mock data calls with `/v1/*` APIs.
