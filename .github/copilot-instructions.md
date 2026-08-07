# OMDS Project Instructions & Standards

## Architecture & Code Rules
- This is a modular, feature-oriented Next.js 14 monolith using a Supabase PostgreSQL backend.
- Domain features reside strictly inside `src/features/`.
- Cross-cutting or shared infrastructure must live in `src/core/`.
- Strict File Limit: Source code files must remain under 300 lines of code. If a file approaches 250 lines, split it into separate utilities, hooks, or sub-components.

## TypeScript & Database Patterns
- TypeScript strict mode is enabled. Use `@/*` path alias mapping to `src/*`.
- Use relational integrity and database-side Supabase RPC functions for multi-table transactions (e.g., converting a lead or approving batches).
- Never expose service-role keys or secrets to client components.

## i18n & Layout Standards
- No raw visible UI strings in component markup. Always use `src/core/i18n` localization exports.
- All new features and fields must support both English and Spanish translations.
- Design theme: Dark, premium, operational CRM design utilizing compact Tailwind CSS utility rows and Lucide icons.

## Documentation Rules
- CRITICAL AUTOMATION: Immediately after completing any coding feature, bug fix, or roadmap task, you MUST automatically open and update `CHANGELOG.md` under the `[Unreleased]` section.
- You MUST also automatically open `TODO.md` to check off the completed item and append any new technical debt or follow-up tasks discovered during development.
