-- Phase 2: Ingestion pipeline tables for OCR, Voice, and SMS import

-- Enums
CREATE TYPE job_type AS ENUM ('ocr', 'voice', 'sms');
CREATE TYPE job_status AS ENUM ('queued', 'processing', 'completed', 'failed');

-- Ingestion Jobs — tracks OCR/voice/SMS processing pipelines
CREATE TABLE ingestion_jobs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  created_by UUID NOT NULL REFERENCES auth.users(id),
  type job_type NOT NULL,
  status job_status NOT NULL DEFAULT 'queued',
  input_ref TEXT,                          -- Supabase Storage path or inline text ref
  input_hash TEXT,                         -- SHA-256 for duplicate detection
  output_transaction_id UUID REFERENCES transactions(id),
  raw_payload JSONB,                       -- Raw OCR/STT/SMS text
  parsed_result JSONB,                     -- Structured parse output
  confidence NUMERIC(5,2),                 -- 0.00–100.00
  error_message TEXT,
  attempts INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Transaction Sources — links a transaction back to its ingestion origin
CREATE TABLE transaction_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  transaction_id UUID NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  job_id UUID NOT NULL REFERENCES ingestion_jobs(id) ON DELETE CASCADE,
  raw_text TEXT,
  confidence NUMERIC(5,2),
  provider_response JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- SMS Messages — raw bank SMS storage for audit and debugging
CREATE TABLE sms_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  household_id UUID NOT NULL REFERENCES households(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id),
  raw_text TEXT NOT NULL,
  sender_phone TEXT,
  parsed_result JSONB,
  confidence NUMERIC(5,2),
  job_id UUID REFERENCES ingestion_jobs(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for high-frequency queries
CREATE INDEX idx_jobs_household_status ON ingestion_jobs(household_id, status, created_at DESC);
CREATE INDEX idx_jobs_input_hash ON ingestion_jobs(input_hash) WHERE input_hash IS NOT NULL;
CREATE INDEX idx_jobs_created_by ON ingestion_jobs(created_by, created_at DESC);
CREATE INDEX idx_tx_sources_transaction ON transaction_sources(transaction_id);
CREATE INDEX idx_tx_sources_job ON transaction_sources(job_id);
CREATE INDEX idx_sms_household ON sms_messages(household_id, created_at DESC);

-- Row Level Security
ALTER TABLE ingestion_jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE sms_messages ENABLE ROW LEVEL SECURITY;
