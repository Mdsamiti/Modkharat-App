-- Add balance column to accounts
ALTER TABLE accounts
  ADD COLUMN balance NUMERIC(14, 2) NOT NULL DEFAULT 0;
