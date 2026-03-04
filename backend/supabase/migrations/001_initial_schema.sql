-- Modkharat-App: Initial Database Schema
-- Run this migration against your Supabase PostgreSQL database

-- ============================================================
-- Extensions
-- ============================================================
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ============================================================
-- Enums
-- ============================================================
CREATE TYPE transaction_type AS ENUM ('income', 'expense');
CREATE TYPE capture_method AS ENUM ('manual', 'sms', 'voice', 'scan');
CREATE TYPE transaction_status AS ENUM ('draft', 'confirmed', 'rejected');
CREATE TYPE budget_period AS ENUM ('weekly', 'monthly', 'yearly');
CREATE TYPE household_role AS ENUM ('organizer', 'member');
CREATE TYPE notification_type AS ENUM ('budget', 'goal', 'unusual', 'system');
CREATE TYPE invite_channel AS ENUM ('email', 'sms');

-- ============================================================
-- Profiles (extends auth.users)
-- ============================================================
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL DEFAULT '',
  avatar_emoji TEXT NOT NULL DEFAULT '👤',
  language TEXT NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'ar')),
  timezone TEXT NOT NULL DEFAULT 'Asia/Riyadh',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', ''));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ============================================================
-- Households (family workspace)
-- ============================================================
CREATE TABLE households (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- Household Members
-- ============================================================
CREATE TABLE household_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role household_role NOT NULL DEFAULT 'member',
  view_only BOOLEAN NOT NULL DEFAULT false,
  can_add_transactions BOOLEAN NOT NULL DEFAULT true,
  can_edit_budgets BOOLEAN NOT NULL DEFAULT false,
  can_manage_members BOOLEAN NOT NULL DEFAULT false,
  joined_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  UNIQUE (household_id, user_id)
);

CREATE INDEX idx_household_members_user ON household_members(user_id);
CREATE INDEX idx_household_members_household ON household_members(household_id);

-- ============================================================
-- Categories
-- ============================================================
CREATE TABLE categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  icon TEXT NOT NULL DEFAULT '📦',
  color TEXT NOT NULL DEFAULT '#6b7280',
  is_system BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_categories_household ON categories(household_id);

-- ============================================================
-- Accounts
-- ============================================================
CREATE TABLE accounts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  name_en TEXT NOT NULL,
  name_ar TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_accounts_household ON accounts(household_id);

-- ============================================================
-- Transactions
-- ============================================================
CREATE TABLE transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  type transaction_type NOT NULL,
  amount NUMERIC(14, 2) NOT NULL,
  merchant TEXT NOT NULL DEFAULT '',
  notes TEXT,
  method capture_method NOT NULL DEFAULT 'manual',
  status transaction_status NOT NULL DEFAULT 'confirmed',
  has_receipt BOOLEAN NOT NULL DEFAULT false,
  occurred_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_transactions_household_date ON transactions(household_id, occurred_at DESC);
CREATE INDEX idx_transactions_household_category ON transactions(household_id, category_id);
CREATE INDEX idx_transactions_status ON transactions(status, created_at);
CREATE INDEX idx_transactions_created_by ON transactions(created_by);

-- ============================================================
-- Budgets
-- ============================================================
CREATE TABLE budgets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  category_id UUID REFERENCES categories(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  limit_amount NUMERIC(14, 2) NOT NULL CHECK (limit_amount > 0),
  period budget_period NOT NULL DEFAULT 'monthly',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_budgets_household ON budgets(household_id);

-- ============================================================
-- Goals
-- ============================================================
CREATE TABLE goals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  name TEXT NOT NULL,
  target NUMERIC(14, 2) NOT NULL CHECK (target > 0),
  saved NUMERIC(14, 2) NOT NULL DEFAULT 0 CHECK (saved >= 0),
  target_date DATE,
  monthly_contribution NUMERIC(14, 2) DEFAULT 0,
  icon TEXT NOT NULL DEFAULT '🎯',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goals_household ON goals(household_id);

-- ============================================================
-- Goal Contributions
-- ============================================================
CREATE TABLE goal_contributions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  goal_id UUID NOT NULL REFERENCES goals(id) ON DELETE CASCADE,
  transaction_id UUID REFERENCES transactions(id) ON DELETE SET NULL,
  amount NUMERIC(14, 2) NOT NULL CHECK (amount > 0),
  contributed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_goal_contributions_goal ON goal_contributions(goal_id, contributed_at DESC);

-- ============================================================
-- Notifications
-- ============================================================
CREATE TABLE notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  household_id UUID REFERENCES households(id) ON DELETE CASCADE,
  type notification_type NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX idx_notifications_user_read ON notifications(user_id, read_at);
CREATE INDEX idx_notifications_user_created ON notifications(user_id, created_at DESC);

-- ============================================================
-- Family Invites
-- ============================================================
CREATE TABLE family_invites (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  invited_by UUID NOT NULL REFERENCES auth.users(id),
  email TEXT,
  phone TEXT,
  channel invite_channel NOT NULL DEFAULT 'email',
  role household_role NOT NULL DEFAULT 'member',
  token TEXT NOT NULL UNIQUE DEFAULT encode(gen_random_bytes(32), 'hex'),
  expires_at TIMESTAMPTZ NOT NULL DEFAULT (now() + INTERVAL '7 days'),
  accepted_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),

  CHECK (email IS NOT NULL OR phone IS NOT NULL)
);

-- ============================================================
-- Seed: System Categories
-- ============================================================
INSERT INTO categories (id, name_en, name_ar, icon, color, is_system) VALUES
  (gen_random_uuid(), 'Shopping',      'التسوق',            '🛍️', '#8b5cf6', true),
  (gen_random_uuid(), 'Food & Dining', 'الطعام والمطاعم',   '☕',  '#f59e0b', true),
  (gen_random_uuid(), 'Transport',     'المواصلات',          '🚗', '#3b82f6', true),
  (gen_random_uuid(), 'Housing',       'السكن',             '🏠', '#10b981', true),
  (gen_random_uuid(), 'Utilities',     'الخدمات',           '⚡',  '#ef4444', true),
  (gen_random_uuid(), 'Entertainment', 'الترفيه',           '🎬', '#ec4899', true),
  (gen_random_uuid(), 'Healthcare',    'الرعاية الصحية',    '🏥', '#14b8a6', true),
  (gen_random_uuid(), 'Education',     'التعليم',           '🎓', '#6366f1', true),
  (gen_random_uuid(), 'Other',         'أخرى',              '📦', '#6b7280', true);

-- ============================================================
-- Row Level Security (deny direct client access by default)
-- ============================================================
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE households ENABLE ROW LEVEL SECURITY;
ALTER TABLE household_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE budgets ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE goal_contributions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE family_invites ENABLE ROW LEVEL SECURITY;

-- Service role bypasses RLS. These policies allow users to read their own data
-- when using the Supabase client directly (optional, since we primarily use service role from backend).
CREATE POLICY "Users read own profile" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users update own profile" ON profiles FOR UPDATE USING (auth.uid() = id);
