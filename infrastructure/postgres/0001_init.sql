-- Scaffold: orgs, blueprints, runs, run_steps, run_events, documents, chunks, memory
CREATE EXTENSION IF NOT EXISTS vector;
CREATE EXTENSION IF NOT EXISTS "pgcrypto";
-- RLS enabled per table with organization_id; see database-plan.md
