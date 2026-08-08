- [x] Replace lead and client venue selectors with a shared stored-venue and Google Places review workflow, creating new venues only on final form save.
# OMDS TODO

Migrated from `other_files/Docs_MD/new_TODO_260720.md` on 2026-07-24.
Completed items from Task 1 are omitted; remaining open items below.

## Phase 1 - End-to-End Test Hardening
- [ ] Walk through lead to client to accepted quote to questionnaire to contract to invoice/payment.
- [ ] Verify sign-in and sign-out manually on desktop and mobile layouts.
- [ ] Re-test Messages navigation with empty, loaded, and filtered thread lists.
- [ ] Run the first authenticated mailbox sync and verify imported threads, participants, attachments, and duplicate handling.
- [ ] Run mailbox sync again after the initial-range fix to import historical inbox mail and verify duplicate protection.
- [x] Persist inbound IMAP attachments and expose them through the existing attachment download route.
- [ ] Repeat mailbox sync until the Zoho inbox is fully imported after the 50-email batch limit.
- [ ] Confirm the sync button reports completion without requiring a browser refresh.
- [ ] Confirm the initial test batch shows current Zoho messages, then decide whether historical backfill should remain available.
- [x] Investigate why some thread-detail requests exceed 12 seconds and return 500, including the nested attachment query.
- [ ] Verify optimized thread-detail loading against the previously failing email thread.
- [ ] Repair the existing incorrectly merged email thread after confirming its message boundaries.
- [ ] Add a safe rich-HTML email viewer with size limits and sanitization before exposing stored `body_html`.
- [x] Improve long message thread readability with bounded scrolling and expandable message bodies.
- [x] Show the newest message first in the message reader.
- [ ] Apply `20260807060000_grant_unified_messages_access.sql` in the connected Supabase project before retesting Messages.
- [ ] Complete production smoke testing for the Next.js 16 / React 19 branch. Public, login, and not-found routes pass locally; authenticated workflows and deployment checks remain.
- [ ] Test direct booking flow from client creation through confirmed event. *(Re-test contract creation path after resolver fallback fix.)*
- [ ] Test PV booking flow from client creation through confirmed event and auto-created SAT/Factura.
- [ ] Test non-PV event with manually created SAT/Factura when a client requests a fiscal invoice.
- [ ] Confirm event detail tabs update correctly after booking status changes.
- [ ] Confirm dashboard counts, calendar views, and event/client list filters match the latest data rules.

## Phase 2 - SAT / Factura Polish
- [ ] Confirm venue settings defaults populate new SAT/Factura records: fiscal profile, bank account, fiscal recipient data, due date rule, IVA, and retentions.
- [ ] Keep accountant request summaries all caps across detail, edit, copy, and newly generated records.
- [ ] Review all stale SAT/Factura records created before the latest hydration fixes.
- [ ] Add or refine helper actions for "request from accountant", "issued", "sent to venue", "paid", and complemento steps.
- [ ] Improve SAT payment allocation review for payments that cover multiple facturas.
- [ ] Confirm SAT/Factura data appears read-only in Event Financials and updates as the factura workflow changes.

## Phase 3 - Payroll Polish
- [ ] Continue testing staffing-to-payroll sync from event staffing assignments.
- [ ] Confirm driver A/B pay defaults use one-way driver pay only.
- [ ] Confirm payroll line items must be approved before payment batching.
- [ ] Test Wednesday scheduled payment behavior for current, past, and future events.
- [ ] Review payroll payment exports and payment proof fields after real test data is entered.

## Phase 4 - Reports Module
- [ ] Build report landing page with cards for sales, confirmed events, payroll, net profit, SAT outstanding, and exports.
- [ ] Add event profitability report using revenue, COG, commissions, payroll, expenses, and SAT status.
- [ ] Add SAT outstanding report grouped by venue/payment partner.
- [ ] Add payroll payable report grouped by scheduled Wednesday and staff member.
- [ ] Add CSV export actions for key reports.

## Phase 5 - Messages / Tasks
- [ ] Define message center scope before implementation: lead messages, client messages, templates, email logging, or actual sending. The current unified inbox foundation and email adapter contract are in place; provider delivery and Lead/Client conversion actions remain open.
- [ ] Add server environment values for `EMAIL_ADDRESS`, `EMAIL_IMAP_HOST`, `EMAIL_IMAP_USERNAME`, `EMAIL_IMAP_PASSWORD`, `EMAIL_SMTP_HOST`, and optional SMTP/IMAP ports, TLS, and credentials before implementing live mailbox sync. Settings now surfaces persisted provider status and safe email adapter readiness.
- [ ] Add outbound delivery and scheduled/background execution around the authenticated inbound sync route. The sync route now persists IMAP cursor state, threads, participants, and inbound messages once mailbox credentials are available.
- [ ] Define task module scope: manual tasks, event tasks, workflow-generated tasks, and due dates.
- [ ] Add workflow-generated tasks for high-value moments only after the booking and SAT flows are stable.

## Phase 6 - PDF / Output Polish
- [ ] Revisit run sheet print layout and keep it close to two pages plus selected files.
- [x] Add polished quote PDF output.
- [x] Add polished invoice PDF output.
- [x] Replace print-to-PDF dependence with true server-generated PDF download actions for quote and invoice outputs.
- [x] Add polished contract PDF output.
- [x] Tighten contract preview/PDF cover and signature styling to better match the OMDS reference.
- [x] Route contract preview and exported PDF rendering through the same shared shell-based layout so editor preview and download output stay visually aligned.
- [x] Fix contract PDF venue/date data hydration paths so real event values are used reliably in cover metadata.
- [x] Add contract PDF print-safe top/bottom margins for server-rendered outputs with page footers.
- [x] Add forced contract Terms & Conditions page splits after clauses 5 and 10 (sections 6 and 11 start on new pages).
- [x] Add downloadable client portal documents after each document workflow is stable.
- [ ] Add event file attachments to printed/exported run sheet output when selected.

## Phase 7 - Final Cleanup
- [ ] Re-run LOC checks and split any code files near 250 LOC.
- [ ] Split the existing oversized source files reported by `npm run check:file-sizes`.
- [ ] Review i18n coverage for newly added screens and controls.
- [ ] Update `PROJECT_HANDOFF.md` with latest SAT, payroll, calendar, and report decisions.
- [ ] Run full `npm run typecheck` and `npm run build` after each completed phase.

## Phase 8 - Quote Builder Settings Drawer
- [x] `Payment` placeholder: replaced with a real Payment Plan selector wired to Settings / Payment Plans (`QuotePaymentPlanSection`).
- [x] `Questionnaire` placeholder: later select templates by event type and direct/PV booking rules.
- [x] `Contract` placeholder: later select templates by event type and direct/PV booking rules.

## Phase 9 - Low Priority Booking Pricing Rules
- [ ] Keep accepted quote versions locked as historical client-facing offers.
- [ ] Do not create quote revisions for normal post-acceptance guest count updates unless service package or pricing agreement changes.
- [ ] Add future booking/invoice adjustment logic for final guest count, final balance, and billable minimums.
- [ ] Track original estimated guest count separately from final confirmed guest count.
- [ ] For Direct events within 6 months, default booking guest count to the quoted estimate.
- [ ] For Direct events more than 6 months away, allow booking with OMDS minimum guest count of 30 while preserving the original estimate.
- [ ] Add final guest count workflow: request updates 30 days before event, allow 10 days for response, then prepare/send final balance around 20 days before event.
- [ ] Default final balance due date to 14 days before the event.
- [ ] Model service-level billable quantities instead of relying only on event guest count.
- [ ] Add editable service-level rules: primary service 90-100%, second service 80-90%, third and beyond 70%.
- [ ] Store billable percent, billable quantity, and minimum-rule reason per quote/invoice line when this feature is built.

## Phase 10 - Contract & Email Template Power-Ups
- [x] Add Phase 1 template tooling for Contract + Email Templates (shared token catalog, insertion assistant, unknown-token warnings, and rendered preview values).
- [x] Add Phase 2 snippet/clauses quick-insert library for Contract + Email body authoring.
- [x] Add unresolved-token blocker before save/publish to prevent unsupported placeholders from shipping.
- [x] Add EN/ES parity checks for required token/section coverage across paired templates.
- [x] Add template version history with diff + rollback for Contract and Email templates.
- [x] Add OMDS signing profile settings for authorized signer identity used in contract signatures.
- [x] Add company-profile branding settings and wire legal/branding tokens into contract preview and PDF output.
- [x] Add conditional section blocks (booking type/event type/document context) for template rendering.
- [x] Add usage impact panel showing where each contract/email template is currently referenced.

## Phase 11 - Template Token Wiring
- [ ] Audit and confirm correct data source for every registered token in the catalog; document any that are aspirational-only vs already wired.
- [ ] Wire `financials.subtotal` → sum of accepted quote version line items (pre-tax) into contract token substitution.
- [ ] Wire `financials.tax` → 16% IVA calculated from subtotal into contract token substitution.
- [ ] Wire `financials.total` → subtotal + tax into contract token substitution (evaluate consolidating with existing `quote.total`).
- [ ] Wire `financials.retainer_mxn` → retainer invoice `total_mxn` into contract token substitution.
- [ ] Wire `financials.balance_mxn` → balance invoice `total_mxn` into contract token substitution.
- [ ] Wire `financials.balance_due_date` → balance invoice `due_at` into contract token substitution (evaluate consolidating with existing `invoice.dueDate`).
- [ ] Investigate USD conversion strategy for `financials.retainer_usd` and `financials.balance_usd` — no USD field in system yet; decide whether to use a fixed exchange rate, a settings-level rate, or remove the tokens.
- [ ] Wire `item.name_N`, `item.desc_N`, `item.qty_N`, `item.unit_N`, `item.total_N` → accepted quote version `items[N-1]` fields into contract token substitution (start with items 1–2 matching the default template).
- [ ] Decide the upper limit for numbered item tokens (currently 1–2) and document the convention for templates.
- [ ] Review existing catalog tokens (`quote.total`, `quote.retainer`, `quote.balance`, `invoice.dueDate`) for overlap with the new `financials.*` tokens and decide whether to deprecate or keep both namespaces.
- [ ] Run a full token audit across all saved contract and email templates in the database to surface any additional unregistered tokens before the next release.

## Phase 12 - Electronic Signature Evidence & Audit Trail
- [x] Keep admin and portal contract PDFs aligned for client address and accepted-quote financial/token hydration.
- [x] Persist approved questionnaire client address data into the official client record for contract output.
- [x] Add document version metadata and SHA-256 hash for the exact resolved contract content.
- [ ] Capture and display client/OMDS signer identity, roles, organizations, and client email.
- [x] Capture acceptance consent text, signing timestamp, portal authentication method, IP address, and user-agent.
- [ ] Record separate created, sent, viewed, terms-accepted, signed, and countersigned lifecycle events.
- [x] Render the stored signing hash and verification metadata on the contract signature page.
- [x] Add regression tests for signature metadata construction, audit events, and PDF output.
- [x] Make client portal signing idempotent so retries cannot duplicate signing events or invoice creation.
- [x] Add an immutable contract audit-events table and persist terms-accepted and signed events with verification metadata.
- [ ] Evaluate drawn/typed signature representation and OMDS countersigning workflow.

## Follow-up / Technical Debt
- [x] Add Google Places autocomplete to the venue form and fill address, website, phone, and Maps URL after selection.
- [x] Add Google distance/time refresh using the Travel/Flete Settings HQ address and persist venue travel fields on save.
- [x] Cache stored venue distance/time and provide an explicit manual refresh action instead of recalculating on every venue save.
- [x] Normalize the Google distance response server-side into distance and duration fields.
- [ ] Final cleanup: restrict the Google Maps API key by production server/deployment and limit it to the APIs used by the integration.
- [x] Add Google attribution/branding near Google Places results.
- [ ] Add development-only owner purge for selected leads/clients and their cascaded records; preserve venues and global configuration.
- [x] Add production archive/unarchive actions and archived-records views for leads and clients.
- [x] Add an archive audit-history panel to lead and client detail views.
- [x] Apply the archive audit RPC migration in Supabase environments.
- [ ] Consider browser-level activity-panel loading/error coverage if a DOM test environment is added; legacy rollout rows retain their stored-summary fallback because historical backfill is intentionally excluded.
- [ ] Messages module: add Lead/Client conversion actions, Meta webhook event normalization/OAuth, TikTok adapters, IMAP/SMTP sync and delivery, and persisted mailbox connection settings.
- [x] Expand phone country metadata to the complete international calling-code catalog.
- [x] Add Settings data-cleanup UI with selected purge and purge-all workflows; event file URL records are purged with their events. Revisit Storage cleanup if uploads are added later.
- [x] Hide unused quoted line-item rows when contracts contain fewer products than the template row count.
- [x] Align admin invoice View and PDF download with the branded quote document shell.
- [x] Show selected quote currency in quote PDF totals and display the effective exchange rate for non-MXN quotes.
- [x] Align admin quote View and PDF download with the branded contract-style document shell.
- [x] Register dynamic payment-plan percentage tokens in the Template Token catalog.
- [x] Make payment schedule retainer and final-balance percentages dynamic contract tokens.
- [x] Target questionnaire apply actions at the client detail record currently being reviewed.
- [x] Hide repeat questionnaire review actions after approval and direct approved submissions to the apply-data workflow.
- [x] Make approved questionnaire client address application resilient to incomplete template scope and missing primary-contact flags.
- [x] Review the remaining seeded template defaults in migrations/docs (`new_booking`, `service_contract`, and email template seeds) and decide whether they should stay as intentional bootstrap data or move to a dedicated settings seed path.
- [x] Add regression tests for template-scoped questionnaire apply logic (partial template field coverage should only update included CRM fields).
- [x] Add a nested `Catalog` button/page inside Questionnaire Templates instead of adding another main Settings section.
- [x] Add a one-click "Import defaults" action to pre-populate questionnaire field catalog entries from the legacy static field list.
- [x] Make Questionnaire Field Catalog field keys preset-based and auto-fill the technical mapping from the selected key.
- [x] Rework the Questionnaire Field Catalog form into a guided flow with read-only technical mapping preview.
- [x] Remove the manual Questionnaire Field Catalog create path and make the catalog import-only for new field keys.
- [x] Add a preview-and-confirm step before importing default Questionnaire Field Catalog entries.
- [x] Add safe optional questionnaire fields for `Client Role` and `Approximate Guest Count`.
- [x] Add a capture-only `Secondary Contact` questionnaire field for manual follow-up.
- [x] Auto-create and display event-side secondary contacts from the `Secondary Contact` questionnaire field.
- [x] Upgrade `Secondary Contact` to a repeatable structured questionnaire group (name, role, phone, email).
- [x] Prevent duplicate secondary-contact creation when questionnaire data is re-applied.
- [x] Add automated file-size checks with baseline caps to prevent new oversized source files.
- [x] Align file-size warning behavior to only flag files near the 300 LOC cap.
- [x] Make `additional.secondaryContacts` the default questionnaire key for structured secondary contacts while retaining legacy key support.
- [x] Ensure questionnaires created from Client Details inherit the selected Quote Builder questionnaire template key.
- [x] Add quote-accept flow guidance in portal: stay on quote page or proceed directly to questionnaire.
- [x] Auto-create and send questionnaire on portal quote acceptance when one is not already active for the event.
- [x] Inherit the selected quote contract template when creating/preparing contracts after questionnaire approval.
- [x] Add public portal contract and invoice tabs with magic-link signing/payment actions.
- [x] Mirror the new portal document list + clean view/download actions across admin client detail tabs for quote/contract/invoice/questionnaire parity.
- [x] Fix admin client detail row action dropdown clipping inside section wrappers.
- [x] Position admin row action dropdowns to open upward so bottom rows do not require page scrolling to access actions.
- [x] Restructure admin list table wrappers so dropdown menus are not clipped by table header/container overflow.
- [x] Replace row action dropdown implementation with a fixed-position anchored popover to bypass table clipping contexts.
- [x] Fix Admin `+Add Questionnaire` runtime create error by handling existing `(event_id, template_key)` questionnaires idempotently.
- [x] Admin Questionnaires: add modal workflow for sending (select event contacts + add ad-hoc contact, questionnaire templates, email template default), and save draft email into Messages tab before final send.
- [x] Admin Contracts: add modal workflow parallel to questionnaires (contact selection, contract template, contract email template), plus draft-first send orchestration into Messages.
- [x] Admin Invoices: add simplified "create invoice on the fly" builder for ad-hoc add-ons (e.g., personalized products and custom menu items).
- [x] Admin list actions: implement live reminder sends for questionnaire/contract/invoice rows once email-template and messaging systems are wired.
- [x] Add inline reminder-send feedback and loading safeguards so row reminders are visibly confirmed and not double-submitted.
- [x] Add row-level reminder in-flight labels so users see which specific document reminder is currently sending.
- [x] Move reminder feedback to per-row status (sent timestamp and row-level failure) instead of section-wide alerts.
- [x] Persist row-level reminder sent timestamps from message draft records so reminder status survives page refresh and tab navigation.
- [x] Surface persisted reminder sender identity per document row so staff can see who last sent a reminder without switching tabs.
- [x] Show compact per-row reminder history (latest 3 sends with timestamp and sender) directly under each row action menu.
- [x] Add row-level line-item hover previews in Quote and Invoice list views to avoid opening each document for quick content checks.
- [x] Harden line-item preview UX with a reliable hover/click popover (instead of native title tooltip) so details render consistently in list tables.
- [x] Reduce reminder list visual noise by moving per-row history details into on-demand popovers while keeping persisted timestamp/sender context.
- [x] Consolidate small row-detail overlays (line-items and reminder history) onto one shared icon-popover primitive to keep behavior consistent and reduce duplicate UI logic.
- [x] Tighten icon-popover accessibility labels and remove unused reminder helper surface left behind by the shared-popover refactor.
- [x] Add explicit popup semantics and keyboard shortcut metadata to the shared icon-popover trigger for stronger screen-reader and keyboard clarity.
- [x] Add keyboard focus handoff from popover trigger into popover content (Enter/Space/ArrowDown) to improve screen-reader and keyboard traversal.
- [x] Add context-specific visually hidden headings to shared icon-popovers so assistive technologies get clear panel context without adding visual noise.
- [x] Build Email Templates settings section and wire contract/questionnaire send modals to live email template options.
- [x] Add dedicated admin contract/questionnaire detail pages (instead of in-row expansion) and wire list view actions to route-based detail screens.
- [x] Seed the OMDS direct and preferred-vendor contract templates with structured HTML bodies so the default preview/PDF experience starts from the branded document style.
- [x] Standardize Settings section list headers to include the Travel/Flete-style back control (ArrowLeft + Back) for Expense, Equipment, Product, Payroll Task, Payment Plans, Questionnaire Templates, Contract Templates, and Email Templates.
- [x] Add archive/unarchive and delete controls for Questionnaire, Contract, and Email template settings lists.
- [x] Add delete safeguard to prevent removing default Questionnaire, Contract, and Email templates.
- [x] Block deletion of Questionnaire/Contract/Email templates when already referenced by existing records; instruct users to archive instead.
- [x] Ensure contracts store body snapshots (`contract_data.body`) and harden portal reads/backfill to prefer snapshots.
- [x] Fix contract PDF export to prefer the stored contract snapshot body over the current template body so refreshed contracts no longer render the legacy layout.
- [x] Add Questionnaire Template builder UX upgrades: accordion sections, question reordering, upload/image question types, and live preview panel.
- [x] Implement persistent file storage for questionnaire upload/image fields with portal upload API + protected storage bucket policies.
- [x] Add questionnaire attachment chips with Open/Remove actions and secure signed-link retrieval endpoint.
- [x] Add live preview panels for Contract Template and Email Template settings pages to match questionnaire preview workflow.
- [x] Add secure remove flow for stored questionnaire attachments and inline partial upload error feedback.
- [x] Add per-file upload status visibility (queued/uploading/uploaded/failed) for questionnaire attachment uploads.
- [x] Add an Admin Client Details Files tab to list, open, and delete questionnaire-uploaded attachments.
- [x] Add a delete confirmation prompt in the Admin Client Details Files tab before removing attachments.
- [x] Align Admin Client Details Files delete confirmation to the shared in-app CRM confirmation modal (replace browser confirm).
