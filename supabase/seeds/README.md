# Supabase Seed Data

This directory is the forward path for bootstrap/sample data.

## Policy
- Schema and constraints belong in `supabase/migrations`.
- Seed/bootstrap content belongs in `supabase/seeds`.
- Do not add seed `insert` blocks to new migrations unless absolutely necessary for schema integrity.

## Template Seed Files
- `supabase/seeds/20260725023000_seed_default_questionnaire_templates.sql`
- `supabase/seeds/20260727021000_seed_default_email_templates.sql`
- `supabase/seeds/20260727022000_seed_contract_templates.sql`

## Restart Workflow (Recommended)
1. Apply schema migrations in order.
2. Run the template seed SQL files from this folder in order:
	- `20260725023000_seed_default_questionnaire_templates.sql`
	- `20260727021000_seed_default_email_templates.sql`
	- `20260727022000_seed_contract_templates.sql`
3. Validate defaults in Settings:
	- Questionnaire Templates
	- Email Templates

## Why This Exists
Historical migrations in this project include some seed/default records and column defaults created during initial build-out.
For new work going forward, keep seed data here so schema migrations remain deterministic and easier to audit.
