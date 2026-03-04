-- =============================================================
-- Seed Data for Modkharat-App Development/Testing
-- =============================================================
-- Run this AFTER migrations. It creates sample data for a test
-- user (must already exist in auth.users via Supabase Auth).
--
-- Usage:
--   1. Create a test user via Supabase Auth (e.g. ahmed@test.com)
--   2. Copy the user's UUID
--   3. Replace 'YOUR_USER_ID_HERE' below with the actual UUID
--   4. Run: psql $DATABASE_URL < supabase/seed.sql
-- =============================================================

-- ⚠️  Replace this with your actual test user's auth.users.id
\set test_user_id '''YOUR_USER_ID_HERE'''

-- Profile
INSERT INTO profiles (id, display_name, avatar_emoji, language, timezone)
VALUES (:test_user_id, 'Ahmed', '👨‍💻', 'en', 'Asia/Riyadh')
ON CONFLICT (id) DO UPDATE SET display_name = EXCLUDED.display_name;

-- Household
INSERT INTO households (id, name, created_by)
VALUES ('11111111-1111-1111-1111-111111111111', 'Al-Samti Family', :test_user_id)
ON CONFLICT (id) DO NOTHING;

-- Household membership (organizer)
INSERT INTO household_members (household_id, user_id, role, view_only, can_add_transactions, can_edit_budgets, can_manage_members)
VALUES ('11111111-1111-1111-1111-111111111111', :test_user_id, 'organizer', false, true, true, true)
ON CONFLICT (household_id, user_id) DO NOTHING;

-- Get category IDs for seeding transactions
-- (categories were already seeded by the migration)

-- Sample Transactions (last 30 days)
DO $$
DECLARE
  hh_id UUID := '11111111-1111-1111-1111-111111111111';
  u_id  UUID := :test_user_id;
  cat_food UUID;
  cat_transport UUID;
  cat_shopping UUID;
  cat_bills UUID;
  cat_salary UUID;
  cat_health UUID;
BEGIN
  SELECT id INTO cat_food FROM categories WHERE name_en = 'Food & Dining' AND is_system = true LIMIT 1;
  SELECT id INTO cat_transport FROM categories WHERE name_en = 'Transportation' AND is_system = true LIMIT 1;
  SELECT id INTO cat_shopping FROM categories WHERE name_en = 'Shopping' AND is_system = true LIMIT 1;
  SELECT id INTO cat_bills FROM categories WHERE name_en = 'Bills & Utilities' AND is_system = true LIMIT 1;
  SELECT id INTO cat_salary FROM categories WHERE name_en = 'Salary' AND is_system = true LIMIT 1;
  SELECT id INTO cat_health FROM categories WHERE name_en = 'Healthcare' AND is_system = true LIMIT 1;

  -- Income: Salary
  INSERT INTO transactions (household_id, created_by, type, amount, merchant, category_id, method, status, occurred_at)
  VALUES
    (hh_id, u_id, 'income', 15000.00, 'Monthly Salary', cat_salary, 'manual', 'confirmed', NOW() - INTERVAL '25 days'),
    (hh_id, u_id, 'income', 15000.00, 'Monthly Salary', cat_salary, 'manual', 'confirmed', NOW() - INTERVAL '55 days');

  -- Expenses
  INSERT INTO transactions (household_id, created_by, type, amount, merchant, category_id, method, status, occurred_at)
  VALUES
    (hh_id, u_id, 'expense', 245.00, 'Tamimi Markets', cat_food, 'sms', 'confirmed', NOW() - INTERVAL '1 day'),
    (hh_id, u_id, 'expense', 89.50, 'Jarir Bookstore', cat_shopping, 'manual', 'confirmed', NOW() - INTERVAL '2 days'),
    (hh_id, u_id, 'expense', 150.00, 'STC Pay - Internet', cat_bills, 'sms', 'confirmed', NOW() - INTERVAL '3 days'),
    (hh_id, u_id, 'expense', 62.00, 'Uber Ride', cat_transport, 'manual', 'confirmed', NOW() - INTERVAL '4 days'),
    (hh_id, u_id, 'expense', 320.00, 'Danube Supermarket', cat_food, 'scan', 'confirmed', NOW() - INTERVAL '5 days'),
    (hh_id, u_id, 'expense', 45.00, 'Nahdi Pharmacy', cat_health, 'manual', 'confirmed', NOW() - INTERVAL '6 days'),
    (hh_id, u_id, 'expense', 1200.00, 'Saudi Electricity', cat_bills, 'sms', 'confirmed', NOW() - INTERVAL '7 days'),
    (hh_id, u_id, 'expense', 175.00, 'Al Baik Restaurant', cat_food, 'manual', 'confirmed', NOW() - INTERVAL '8 days'),
    (hh_id, u_id, 'expense', 550.00, 'Extra Electronics', cat_shopping, 'manual', 'confirmed', NOW() - INTERVAL '10 days'),
    (hh_id, u_id, 'expense', 35.00, 'Careem Ride', cat_transport, 'sms', 'confirmed', NOW() - INTERVAL '12 days'),
    (hh_id, u_id, 'expense', 280.00, 'Panda Supermarket', cat_food, 'scan', 'confirmed', NOW() - INTERVAL '14 days'),
    (hh_id, u_id, 'expense', 95.00, 'Water Delivery', cat_bills, 'manual', 'confirmed', NOW() - INTERVAL '15 days'),
    (hh_id, u_id, 'expense', 420.00, 'Zara', cat_shopping, 'manual', 'confirmed', NOW() - INTERVAL '18 days'),
    (hh_id, u_id, 'expense', 28.00, 'Gas Station', cat_transport, 'manual', 'confirmed', NOW() - INTERVAL '20 days');

  -- Draft transaction (from SMS parse)
  INSERT INTO transactions (household_id, created_by, type, amount, merchant, category_id, method, status, occurred_at)
  VALUES
    (hh_id, u_id, 'expense', 199.00, 'Unknown Merchant', NULL, 'sms', 'draft', NOW() - INTERVAL '1 day');
END $$;

-- Budgets
INSERT INTO budgets (id, household_id, name, limit_amount, category_id, period)
SELECT
  gen_random_uuid(),
  '11111111-1111-1111-1111-111111111111',
  b.name,
  b.lim,
  c.id,
  'monthly'
FROM (VALUES
  ('Food & Dining Budget', 2000.00, 'Food & Dining'),
  ('Transport Budget', 500.00, 'Transportation'),
  ('Shopping Budget', 1500.00, 'Shopping'),
  ('Bills Budget', 2500.00, 'Bills & Utilities')
) AS b(name, lim, cat_name)
JOIN categories c ON c.name_en = b.cat_name AND c.is_system = true
ON CONFLICT DO NOTHING;

-- Goals
INSERT INTO goals (id, household_id, name, target, saved, target_date, monthly_contribution, icon)
VALUES
  ('22222222-2222-2222-2222-222222222201', '11111111-1111-1111-1111-111111111111',
   'Emergency Fund', 50000.00, 15000.00, '2026-12-31', 3000.00, '🏦'),
  ('22222222-2222-2222-2222-222222222202', '11111111-1111-1111-1111-111111111111',
   'New Car', 120000.00, 35000.00, '2027-06-30', 5000.00, '🚗'),
  ('22222222-2222-2222-2222-222222222203', '11111111-1111-1111-1111-111111111111',
   'Hajj Trip', 25000.00, 8000.00, '2026-05-15', 2000.00, '🕋')
ON CONFLICT (id) DO NOTHING;

-- Goal contributions
INSERT INTO goal_contributions (goal_id, amount, contributed_at)
VALUES
  ('22222222-2222-2222-2222-222222222201', 5000.00, NOW() - INTERVAL '60 days'),
  ('22222222-2222-2222-2222-222222222201', 5000.00, NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222201', 5000.00, NOW() - INTERVAL '1 day'),
  ('22222222-2222-2222-2222-222222222202', 15000.00, NOW() - INTERVAL '90 days'),
  ('22222222-2222-2222-2222-222222222202', 10000.00, NOW() - INTERVAL '60 days'),
  ('22222222-2222-2222-2222-222222222202', 10000.00, NOW() - INTERVAL '30 days'),
  ('22222222-2222-2222-2222-222222222203', 4000.00, NOW() - INTERVAL '60 days'),
  ('22222222-2222-2222-2222-222222222203', 4000.00, NOW() - INTERVAL '30 days');

-- Notifications
INSERT INTO notifications (user_id, household_id, type, title, message, metadata)
VALUES
  (:test_user_id, '11111111-1111-1111-1111-111111111111', 'budget',
   'Budget Warning', 'Food & Dining budget is at 85% usage', '{"budgetName": "Food & Dining Budget", "percentage": 85}'),
  (:test_user_id, '11111111-1111-1111-1111-111111111111', 'goal',
   'Goal Milestone', 'Emergency Fund reached 30% of target!', '{"goalName": "Emergency Fund", "percentage": 30}'),
  (:test_user_id, '11111111-1111-1111-1111-111111111111', 'unusual',
   'Unusual Spending', 'Higher than normal spending at Extra Electronics (SAR 550)', '{"merchant": "Extra Electronics", "amount": 550}'),
  (:test_user_id, '11111111-1111-1111-1111-111111111111', 'system',
   'Welcome to Modkharat', 'Your account is set up and ready to track expenses.', '{}');

SELECT 'Seed data inserted successfully!' AS status;
