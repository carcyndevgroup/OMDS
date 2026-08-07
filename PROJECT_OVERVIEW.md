# OMDS Web App - System Architecture and Developer Reference

Last updated: 2026-07-24

This document is a technical handoff and architecture reference for the Oh My Desserts & Snacks web application. It summarizes the current system, business rules, code structure, database model, setup requirements, and known roadmap items.

## 1. Project Overview & Objective

Oh My Desserts & Snacks, abbreviated OMDS, is a live-station dessert and snack catering business based in Cancun and serving wedding, social, corporate, hotel, and venue events.

This project is building an internal all-in-one operating system for OMDS. The goal is to replace scattered CRM, quote, booking, invoice, SAT/factura, payroll, staffing, and operations workflows with one connected application.

The app currently supports this core business lifecycle:

```text
Lead
  -> Client booking record
  -> Quote
  -> Client portal acceptance
  -> Booking questionnaire
  -> Contract
  -> Invoice or PV internal fiscal record
  -> Confirmed event
  -> Timeline, staffing, equipment, run sheet, files, financials
  -> SAT/factura follow-up and payroll
```

Important domain distinction:

- `Lead` records are potential inquiries.
- `Client` records are booking-focused and event-specific. The same real person may appear more than once if they book more than one event.
- `Event` records exist in the database during booking, but the Events module is treated as the operations/logistics area for confirmed events.
- Direct bookings are paid by the client.
- Preferred Vendor, or PV, bookings are paid through the venue/hotel/payment partner. Clients should not be able to pay OMDS directly for these bookings.
- SAT/Facturas is its own main workflow and should communicate with event financials, but the Event Financials tab should mostly read fiscal/payment state produced by SAT/Facturas.

## 2. Full Tech Stack & Dependencies

### Frontend

- Next.js `^14.2.0`
- React `^18.3.1`
- React DOM `^18.3.1`
- TypeScript `^5.7.0`
- Tailwind CSS `^3.4.17`
- Lucide React `^0.468.0`

### Backend

- Next.js App Router
- Next.js API routes under `src/app/api`
- Server Components for route shells/layouts where possible
- Client Components for interactive CRM forms, portals, tabs, and dashboards

### Database and Auth

- Supabase Postgres
- Supabase Auth
- Supabase Row Level Security
- Supabase RPC functions for multi-table transactions and public portal access
- `@supabase/supabase-js` `^2.108.2`
- `@supabase/ssr` `^0.12.0`

### Runtime and Tooling

- Node.js compatible with Next.js 14
- npm package management
- TypeScript strict mode
- Tailwind/PostCSS/Autoprefixer

### Third-Party Libraries

| Package | Purpose |
| --- | --- |
| `next` | App Router, server rendering, API routes, routing |
| `react`, `react-dom` | UI rendering |
| `@supabase/supabase-js` | Browser/server database client |
| `@supabase/ssr` | Supabase auth/session handling with Next.js cookies |
| `lucide-react` | Icon system for navigation, buttons, cards, tabs |
| `tailwindcss` | Utility-first styling |
| `typescript` | Static typing |

### External Services and APIs

| Service | Usage |
| --- | --- |
| Supabase | Database, auth, RLS, RPC functions |
| Banxico SIE API | Pulls the current FIX exchange rate for quote currency conversion |

Banxico integration is implemented in:

```text
src/app/api/exchange-rates/banxico/route.ts
```

The Banxico series currently used is:

```text
SF43718
```

The token is read from:

```text
BANXICO_SIE_TOKEN
```

## 3. Project Structure & Architecture

### Architectural Pattern

The app is a modular, feature-oriented Next.js monolith with serverless API routes.

It follows these broad patterns:

- App Router routes in `src/app`.
- Domain features in `src/features`.
- Shared infrastructure in `src/core`.
- Supabase migrations in `supabase/migrations`.
- API routes act as thin transport/controller layers.
- Feature code owns schemas, repositories, mappers, hooks, and UI components.
- Database-side RPC functions handle multi-table writes where consistency matters.

### Annotated Directory Tree

```text
.
├── package.json
│   Defines app scripts and dependencies.
├── tsconfig.json
│   TypeScript strict config and `@/*` path alias to `src/*`.
├── tailwind.config.ts
│   Tailwind source scanning for app, components, features, and core folders.
├── middleware.ts
│   Supabase auth/session middleware.
├── PROJECT_HANDOFF.md
│   Existing long-form handoff document.
├── PROJECT_OVERVIEW.md
│   This architecture and developer reference document.
├── other_files/
│   Business notes, source PDFs, screenshots, test CSVs, historical factura app files,
│   and planning TODOs. Not part of TypeScript compilation.
├── supabase/
│   └── migrations/
│       Chronological SQL migrations for schema, RLS, RPCs, triggers, and seed data.
└── src/
    ├── app/
    │   Next.js App Router pages, layouts, and API routes.
    ├── components/
    │   Shared UI/layout components.
    ├── core/
    │   Cross-cutting infrastructure: i18n, navigation, Supabase clients/types.
    └── features/
        Domain-specific modules for CRM, dashboard, settings, payroll, and SAT/Facturas.
```

### Key `src/app` Routes

```text
src/app/page.tsx
src/app/login/page.tsx
src/app/dashboard/page.tsx
src/app/calendar/page.tsx
src/app/events/page.tsx
src/app/financials/page.tsx
src/app/messages/page.tsx
src/app/tasks/page.tsx
src/app/reports/page.tsx
src/app/portal/[accessKey]/page.tsx
src/app/run-sheets/[id]/page.tsx
src/app/quote-print/[eventId]/[quoteId]/page.tsx
```

CRM routes:

```text
src/app/crm/leads
src/app/crm/clients
src/app/crm/planners
src/app/crm/venues
src/app/crm/staff
src/app/crm/events
```

Settings routes:

```text
src/app/settings
src/app/settings/equipment
src/app/settings/expenses
src/app/settings/payroll-tasks
src/app/settings/products
src/app/settings/travel
```

Payroll routes:

```text
src/app/payroll
src/app/payroll/events/[id]
src/app/payroll/payments
```

SAT/Facturas routes:

```text
src/app/sat-facturas
src/app/sat-facturas/new
src/app/sat-facturas/[id]
src/app/sat-facturas/[id]/edit
src/app/sat-facturas/[id]/workflow
src/app/sat-facturas/payments
src/app/sat-facturas/settings
```

### Key API Areas

```text
src/app/api/crm
src/app/api/dashboard
src/app/api/exchange-rates/banxico
src/app/api/payroll
src/app/api/sat-facturas
src/app/api/settings
```

The API layer generally:

1. Receives requests from client-side hooks/services.
2. Validates/parses request payloads.
3. Calls a feature repository or Supabase RPC.
4. Returns normalized JSON responses.

### Core Infrastructure

```text
src/core/i18n
```

Localization context, translation hook, dictionary exports, and locale management.

```text
src/core/navigation/sidebar-navigation.ts
```

Primary sidebar navigation model.

```text
src/core/supabase
```

Supabase browser/server/admin clients and generated/hand-maintained TypeScript schema types.

```text
src/components/layout/app-shell.tsx
```

Main authenticated application shell with collapsible sidebar and mobile sidebar behavior.

### Feature Modules

```text
src/features/auth
src/features/dashboard
src/features/payroll
src/features/sat-facturas
src/features/settings
src/features/crm
```

CRM is further split by domain:

```text
src/features/crm/client
src/features/crm/contract
src/features/crm/equipment
src/features/crm/event
src/features/crm/files
src/features/crm/financials
src/features/crm/invoice
src/features/crm/lead
src/features/crm/planner
src/features/crm/portal
src/features/crm/questionnaire
src/features/crm/quote
src/features/crm/shared
src/features/crm/staff
src/features/crm/venue
```

### Data Flow Summary

Typical authenticated CRM flow:

```text
User interaction
  -> Client Component
  -> Feature hook/service
  -> Next.js API route
  -> Supabase client or repository
  -> Postgres table/RPC
  -> Response DTO/mapper
  -> React state/render
```

Typical public portal flow:

```text
Portal access URL with access key
  -> Public portal page
  -> Public-safe API/RPC
  -> Supabase security definer function
  -> Filtered portal data only
  -> Client response, quote action, or questionnaire submission
```

Important transactional flows:

- Lead conversion creates client, event, primary event contact, and event services.
- Quote acceptance updates quote/version state and moves the booking into a tentative hold state.
- Questionnaire submission stores structured JSON; CRM review can apply approved fields back into client/event/relationship records.
- Contract signing and Direct invoice payment can move booking into confirmed state.
- Confirmed PV bookings can generate or hydrate SAT/factura records.
- Event staff assignments can sync into payroll line items.
- Payroll batches group approved line items for Wednesday payment cycles.

## 4. Active Rules, Standards & AI Context

### Project Rules

- No god files.
- Code files must remain under 300 lines of code.
- If a code file approaches 250 lines, split into utilities, hooks, repositories, or sub-components.
- All visible UI text must use the i18n localization system.
- The app must support English and Spanish.
- New UI form fields must be approved by the project owner before implementation.
- Prefer existing patterns over new abstractions.
- Keep API routes thin.
- Put database consistency rules in SQL/RPCs when multiple tables must change together.
- Never expose service-role keys or secrets to client components.
- Use Supabase RLS and authenticated policies for internal data.
- Use public portal RPCs with access keys for client-facing data.

### Styling Standards

- Dark, premium, operational CRM design.
- Tailwind CSS utilities.
- Lucide icons for actions and navigation.
- Compact, scan-friendly rows for list pages.
- Avoid oversized marketing sections for internal tools.
- No nested cards unless the UI genuinely needs framed repeated items.
- Use familiar controls: icons, tabs, toggles, selects, inputs, menus.
- Maintain sidebar consistency across app sections.

### TypeScript and Import Standards

- TypeScript strict mode is enabled.
- Path alias:

```json
{
  "@/*": ["./src/*"]
}
```

- Prefer typed schema models from `src/core/supabase`.
- Keep parsing/mapping logic close to the domain feature.

### i18n Standards

- Use `src/core/i18n`.
- No raw visible UI strings in production UI components.
- Add both English and Spanish translation keys.
- Keep dictionary organization aligned to app domains.

### Local AI/Instruction Context

No project-local `.cursorrules`, `AGENTS.md`, or root `.codex` instruction file was found during this scan. Active working rules come from the ongoing project instructions and the existing handoff documentation.

### Documentation Exception

The 300 LOC limit applies to source code files. Large documentation files such as `PROJECT_HANDOFF.md` and this file are intentionally exempt.

## 5. Database Schema & Data Models

The database is Supabase Postgres. Migrations live in:

```text
supabase/migrations
```

### Major Table Groups

#### Auth and Access

| Table | Purpose |
| --- | --- |
| `app_users` | Internal CRM user roles such as owner/staff. |
| `client_portal_access` | Public client portal access keys and section visibility. |

#### Leads and CRM Bookings

| Table | Purpose |
| --- | --- |
| `leads` | Potential inquiries before conversion. |
| `lead_services` | Services requested by a lead. |
| `clients` | Person/contact records used in bookings. |
| `events` | Booking/event records, including booking status, event details, venue, timeline, and operational fields. |
| `event_contacts` | Links clients to events with role and primary-contact flags. |
| `event_services` | Services/products associated with an event. |

#### Venues, Planners, and Staff

| Table | Purpose |
| --- | --- |
| `venues` | Venue/hotel directory, PV rules, fiscal defaults, travel data, sub-location behavior. |
| `venue_contacts` | Contact directory per venue. |
| `venue_sub_locations` | Venue-specific location options. |
| `event_venue_contacts` | Per-event assigned venue contact. |
| `planners` | External planner directory. |
| `event_planners` | Planner relationships per booking/event. |
| `staff_members` | Staff directory and payroll profile fields. |
| `event_staff_assignments` | Driver/operator assignments for event operations and run sheets. |

#### Booking Documents

| Table | Purpose |
| --- | --- |
| `product_catalog` | Products/services used in quote building. |
| `quotes` | Quote container per event/title. |
| `quote_versions` | Versioned quote snapshots with currency, discount, tax, exchange-rate settings, and expiry. |
| `quote_items` | Line items for a quote version. |
| `quote_recipients` | Quote recipient records. |
| `questionnaires` | Booking questionnaire state and JSON responses. |
| `contracts` | Contract state and JSON data. |
| `invoices` | Direct invoices and PV internal fiscal invoice records. |
| `invoice_items` | Invoice line items. |

#### Operations

| Table | Purpose |
| --- | --- |
| `equipment_catalog` | Internal equipment catalog. |
| `event_equipment_assignments` | Event-specific equipment assignments shown in run sheets. |
| `event_files` | Event file metadata/links and run-sheet inclusion flags. |

#### Financials

| Table | Purpose |
| --- | --- |
| `event_commissions` | Event commission records. |
| `expense_categories` | Expense category settings. |
| `event_expenses` | Event-level expense records. |
| `event_staff_payroll` | Earlier event payroll support table. |
| `event_payroll_line_items` | Staff/task/position payment line items. |

#### Payroll

| Table | Purpose |
| --- | --- |
| `payroll_task_catalog` | Payroll task/position catalog with standard pay rates. |
| `payroll_payment_batches` | Scheduled payroll batches, normally Wednesday based. |
| `payroll_payment_batch_items` | Line items included in a batch. |
| `payroll_payments` | Actual staff payment records. |
| `payroll_payment_items` | Line items paid by a payroll payment. |

#### SAT/Facturas

| Table | Purpose |
| --- | --- |
| `sat_fiscal_profiles` | OMDS fiscal emitters/RFC profiles. |
| `sat_bank_accounts` | Bank accounts tied to fiscal profiles. |
| `event_sat_facturas` | Event-specific SAT/factura records and workflow state. |
| `sat_payments` | Venue/client payments received for facturas. |
| `sat_payment_facturas` | Many-to-many payment allocation records for facturas. |

#### Settings

| Table | Purpose |
| --- | --- |
| `app_travel_settings` | HQ address, fuel assumptions, and base fee values for travel/flete. |
| `payment_plans` | Direct-client payment plan definitions. Schema exists; UI integration is in progress. |

### Key Relationships

```text
leads
  -> lead_services
  -> convert to clients/events/event_contacts/event_services

clients
  <-> events through event_contacts

events
  -> event_services
  -> event_contacts
  -> event_planners
  -> event_staff_assignments
  -> event_equipment_assignments
  -> event_files
  -> quotes / questionnaires / contracts / invoices
  -> event_commissions / event_expenses / payroll line items
  -> event_sat_facturas

venues
  -> venue_contacts
  -> venue_sub_locations
  -> events.venue_id
  -> events.payment_partner_venue_id
  -> fiscal defaults used by SAT/Facturas

quotes
  -> quote_versions
  -> quote_items
  -> quote_recipients

sat_payments
  -> sat_payment_facturas
  -> event_sat_facturas
```

### RLS and Access Model

- Supabase RLS is enabled across core business tables.
- Internal CRM access is gated by `public.app_users` and private helper functions such as `private.is_crm_user()`.
- Authenticated CRM users can manage internal records through RLS policies.
- Public portal access uses access-key based security-definer RPC functions instead of exposing table-level public access.
- Service role is used only server-side where necessary.

### Important RPC Functions

Examples of database functions used for consistency and security:

```text
create_client_event
update_client_event
sync_client_portal_access
get_client_portal_access_by_key
get_client_portal_quotes_by_key
respond_client_portal_quote_by_key
get_client_portal_questionnaires_by_key
submit_client_portal_questionnaire_by_key
apply_approved_questionnaire_data
ensure_event_sat_factura
create_sat_payment_with_allocations
create_payroll_payment_batch
next_payroll_wednesday
```

## 6. Setup, Build & Deployment Pipeline

### Required Environment Variables

Create `.env.local` locally. Do not commit real secret values.

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=
SUPABASE_SECRET_KEY=
BANXICO_SIE_TOKEN=
```

Purpose:

| Key | Used by |
| --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Browser and server Supabase clients |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser and server Supabase clients |
| `SUPABASE_SECRET_KEY` | Server/admin Supabase operations only |
| `BANXICO_SIE_TOKEN` | Banxico exchange-rate API route |

### Package Scripts

From `package.json`:

```json
{
  "dev": "next dev",
  "build": "next build",
  "start": "next start",
  "lint": "next lint",
  "typecheck": "tsc --noEmit"
}
```

### Local Setup

```bash
npm install
npm run dev
```

Default local URL:

```text
http://localhost:3000
```

### Validation Commands

```bash
npm run typecheck
npm run build
```

`npm run lint` is configured, but with Next.js 14 it may require the local Next lint setup to be available and supported by the installed version.

### Database Setup

Apply SQL migrations from:

```text
supabase/migrations
```

Migrations are chronological and have often been run manually in the Supabase SQL editor during development. New environments should apply them in filename order.

Current migration families include:

- Lead foundation and CRM auth/RLS.
- Client/event creation and update RPCs.
- Venue profile, settings, contacts, and sub-locations.
- Planner and event planner relationships.
- Event timeline and run-sheet fields.
- Staffing and equipment.
- Product catalog and quote foundation.
- Client portal access, quotes, quote acceptance, and questionnaires.
- Contracts and invoices.
- Financials, commissions, expenses.
- SAT/Facturas, fiscal profiles, bank accounts, workflow, payments.
- Payroll staff profiles, task catalog, line items, batches, and payment records.
- Quote currency, Banxico rate, exchange margin, expiry, and tax toggles.
- Travel/flete settings.
- Payment plans.

### Deployment

No production hosting configuration was found in the workspace. The app is a standard Next.js application and can be deployed to any Next-compatible host, such as Vercel, provided environment variables are configured and Supabase migrations have been applied.

Supabase remains the hosted backend/database/auth provider.

## 7. Current Project State & Roadmap

### Implemented or Mostly Implemented

#### App Foundation

- Next.js App Router project.
- Supabase auth/session handling.
- Login flow.
- Authenticated app shell.
- Collapsible sidebar.
- Dark CRM design system.
- i18n module foundation.
- Dashboard summary cards and calendar snapshot.

#### Leads

- Lead list, create, edit, detail, delete, and conversion.
- Lead status simplification.
- Lead services.
- Compact list row UX with click-anywhere navigation.

#### Clients and Booking Workflow

- Client list, create, edit, and detail.
- Client detail info bar.
- Booking tabs: Overview, Quotes, Questionnaires, Contracts, Invoices, Messages, Tasks, Notes, Client Portal.
- Event-specific client model.
- Event contacts and external planner links.
- Client overview sections: Client Information, Event Details, Venue Details, Services Interested In, Event Contacts, External Planners.

#### Quotes

- Multiple quote options per booking.
- Versioned quote model.
- Draft/sent/viewed/accepted status workflow.
- Product catalog line items.
- Live quote preview.
- Display currency.
- Banxico FIX exchange-rate pull.
- Optional exchange margin.
- Quote expiry with default 14-day policy.
- Discount support.
- IVA and retention tax toggles.
- Public portal quote viewing and acceptance.
- Accepted quote versions become read-only.

#### Questionnaires

- Booking questionnaire foundation.
- Public portal questionnaire form.
- Structured JSON response storage.
- CRM review surface.
- Apply approved questionnaire data to core records.
- Additional client/contact and planner relationship application support.

#### Contracts

- Contract table and basic workflow states.
- Client portal visibility integration.
- Signed contract status can participate in booking confirmation logic.

#### Invoices

- Invoice and invoice item tables.
- Direct invoices.
- PV internal fiscal records.
- Client portal visibility.
- Direct invoice paid state can confirm an event.

#### Venues

- Venue list, create, edit, details.
- Venue profile fields, area, travel data, social/contact notes.
- Venue contacts.
- Venue sub-locations.
- `uses_sub_locations` behavior flag.
- Venue settings for PV/payment/factura/commission behavior.
- Fiscal defaults for SAT/Facturas.

#### Planners

- External planner directory.
- Planner create/edit/details.
- Event planner linking from client booking.
- Commission eligibility can be tracked per event planner link.

#### Events and Operations

- Confirmed events list.
- Event detail tabs: Overview, Timeline, Staffing, Equipment, Links, Run Sheet, Financials, Files, Tasks, Notes.
- Event timeline generation from service start time/travel assumptions.
- Run Sheet operations view.
- Event files metadata with run-sheet inclusion.
- Equipment assignment and run-sheet display.
- Calendar full view with month/week/day views.
- Calendar confirmed/unconfirmed toggle and status coloring.

#### Settings

- Product catalog.
- Equipment catalog.
- Expense categories.
- Payroll task catalog.
- Travel/flete settings.
- Payment plan schema has started.

#### Financials

- Event financial summary.
- Commissions.
- Expenses.
- Staff payroll line items.
- Invoice summary.
- Net/gross profit calculations.

#### SAT/Facturas

- Main SAT/Facturas sidebar section.
- Factura list/detail/edit/workflow pages.
- Manual factura creation, including non-PV events when needed.
- Auto PV factura creation/hydration after confirmation.
- Fiscal profiles and bank accounts.
- Venue default fiscal profile and bank account behavior.
- Accountant request summary.
- IVA/IVA retention/ISR retention fields and toggles.
- Due-date rules, including same-month cutoff handling.
- Payments and payment allocation to multiple facturas.
- Complemento workflow foundation.

#### Payroll

- Staff profiles expanded for payroll.
- Payroll task catalog.
- Event staffing sync to payroll line items.
- Driver A/B standard one-way pay adjustment.
- Payroll approval before batching.
- Wednesday payment batches.
- Payment records with method/account/reference/proof fields.

### Partially Built or Needs Follow-Up

- Payment Plan settings UI/API integration is still incomplete. The `payment_plans` schema exists and should support Direct-only plans such as `40/60` and `Full Payment`.
- Payment plans still need to be selected/applied in quote/invoice/portal flows.
- PV client portal warning still needs to clearly explain that payment is handled through the venue/planner, not OMDS.
- Contract legal text, signature capture, PDF output, and final contract presentation need polish.
- Quote PDF/output design needs polish and should align with future invoice PDF design.
- Run Sheet print/PDF output is improved but still needs final 1-2 page production design.
- Event files currently store metadata/links; Supabase Storage upload is not fully implemented.
- Messages and Tasks modules are placeholders.
- Reports module is a placeholder.
- Full SAT/Factura workflow needs continued polish around accountant email generation, complemento file handling, and payment lifecycle edge cases.
- Flete/travel settings exist, but flete as an automatically calculated quote item still needs final workflow integration.
- Booking pricing rules for guest-count minimums, 90 percent rule, 30-day final count, and multi-service negotiation bands are documented but intentionally low priority.

### Open TODO Sources

Primary active planning file:

```text
other_files/Docs_MD/new_TODO_260720.md
```

Other useful reference docs:

```text
other_files/Docs_MD/PROJECT_HANDOFF.md
other_files/Docs_MD/booking_system.md
other_files/Docs_MD/financial_tab.md
other_files/Docs_MD/staff_module.md
other_files/Docs_MD/staff_roles_tasks.md
other_files/Docs_MD/new_booking_questionnaire.md
other_files/Docs_MD/dropdowns.md
other_files/Docs_MD/Hotel_Venue_List.md
```

### Recommended Next Steps

1. Finish Payment Plan settings UI/API and wire it into Direct invoice generation.
2. Add PV portal guidance so clients understand payment is handled by the venue/payment partner.
3. Finish flete quote item workflow using travel settings.
4. Continue quote/invoice output design polish.
5. Harden end-to-end testing for both Direct and PV paths:
   - Lead to client.
   - Quote created and sent.
   - Portal acceptance.
   - Questionnaire submission and CRM approval.
   - Contract signed.
   - Invoice paid or PV factura generated.
   - Event confirmed.
   - Staffing/payroll/SAT follow-through.
6. Add Messages and Tasks module foundations.
7. Build Reports module after financial/payroll/SAT data stabilizes.

## Appendix: Key Business Rules

### Direct Bookings

- Client pays OMDS directly.
- Direct clients can receive invoices through the client portal.
- Standard payment plan should be `40/60`:
  - 40 percent retainer due on contract signature/invoice generation.
  - Retainer due within 3 days.
  - 60 percent or adjusted balance due 14 days before the event.
- Full payment plan should also be supported.
- Use the term `Retainer`, not `Deposit`.

### Preferred Vendor Bookings

- Venue/hotel/payment partner pays OMDS.
- Client should not receive a payable OMDS invoice.
- Client may need to share quote/contract with venue planner.
- PV bookings may require SAT factura records.
- Venue settings define:
  - payment responsibility,
  - factura recipient,
  - pricing/brochure behavior,
  - commission model,
  - invoice behavior,
  - fiscal profile,
  - bank account,
  - retention rules.

### Quote Versions

- Quotes can have multiple versions.
- Older sent versions should remain read-only once superseded.
- Accepted quote versions are the financial source of truth for that booking unless a later explicit revision is accepted.

### Guest Count and Pricing

- For events within 6 months, quotes use the estimated guest count.
- For events more than 6 months out, clients may book with a standard minimum of 30 guests.
- Final guest count review is requested 30 days before the event.
- If no response, final balance is based on the known estimated guest count.
- General minimum billing rule is 90 percent of guest count.
- Multi-service exceptions can be negotiated:
  - First service: 90 to 100 percent.
  - Second service: roughly 80 to 90 percent.
  - Third and later services: roughly 70 percent.

### Payroll

- Payments are scheduled every Wednesday.
- Pay is event-based.
- Staff are paid by position/task.
- Driver A and Driver B use standard one-way pay.
- Payroll line items require approval before payment batching.

### SAT/Facturas

- PV facturas are generated after event confirmation, not before.
- Non-PV facturas must still be creatable manually when a client requires a fiscal invoice.
- A single venue payment may cover multiple facturas.
- Multiple OMDS fiscal emitters/RFCs are supported.
- Most SAT calculations require up to 6 decimal places.
- Accountant request text should remain copy-friendly and uppercase.
