-- Add first_day_of_month preference to profiles
ALTER TABLE profiles
  ADD COLUMN first_day_of_month INT NOT NULL DEFAULT 1
  CONSTRAINT first_day_of_month_range CHECK (first_day_of_month >= 1 AND first_day_of_month <= 28);
