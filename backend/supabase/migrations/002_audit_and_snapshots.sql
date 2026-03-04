-- Migration 002: Audit logs and budget snapshots

-- ============================================================
-- Audit Logs
-- ============================================================
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  household_id UUID REFERENCES households(id) ON DELETE SET NULL,
  action TEXT NOT NULL,            -- e.g. 'member.permission_change', 'account.delete', 'data.export'
  target_type TEXT,                -- e.g. 'household_member', 'transaction', 'account'
  target_id UUID,
  metadata JSONB DEFAULT '{}',     -- action-specific details
  ip_address TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_audit_logs_user ON audit_logs(user_id, created_at DESC);
CREATE INDEX idx_audit_logs_household ON audit_logs(household_id, created_at DESC);

-- ============================================================
-- Budget Snapshots (monthly planned vs actual history)
-- ============================================================
CREATE TABLE budget_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  budget_id UUID NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  planned NUMERIC(14, 2) NOT NULL,
  actual NUMERIC(14, 2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (budget_id, period_start)
);

CREATE INDEX idx_budget_snapshots_budget ON budget_snapshots(budget_id, period_start DESC);

-- ============================================================
-- RLS
-- ============================================================
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_snapshots ENABLE ROW LEVEL SECURITY;
