# Omnichannel AI Business OS — Phase 1 MVP

Convert the attached HTML prototype into a TanStack Start + TypeScript + Tailwind app with mock data and mock actions only. No real backend integrations.

## Scope

- 28 pages from the prototype, all reachable from a grouped sidebar
- Dark slate enterprise theme, teal accent, Thai-first UI (Inter + Sarabun fonts)
- Reusable layout + common components, floating AI Copilot drawer, toast notifications (sonner)
- All mock data centralized in `src/data/mockData.ts`, typed in `src/types/index.ts`
- All mock interactions in `src/services/mockActions.ts` mutating an in-memory store (zustand) so actions reflect across pages
- Placeholder service files for future Supabase / Gemini gateway / LINE / Telegram / Meta / WhatsApp / route / payment / storage / audit integrations — comments only, no secrets, no real calls

## Routing (TanStack Start)

The template uses TanStack Start, so the requested `pages/` directory becomes file-based routes under `src/routes/` (one file per page, dot-separated). A single `_app.tsx` layout route wraps all pages with `AppLayout` (sidebar + header + copilot). Route slugs follow the sidebar:

```
/                         Dashboard
/inbox                    Unified Inbox
/crm                      CRM
/setup/workspace          Workspace Setup
/setup/invite             Invite Team Member
/setup/login-preview      Login Portal Preview
/ai/inquiries             AI Inquiry Inbox
/ai/visual-catalog        Visual Catalog
/ai/knowledge-files       File & Image Knowledge
/ai/training              AI Training Center
/ai/feedback              AI Feedback & Corrections
/ai/preferences           Customer Preferences
/sales/bookings           Booking Manager
/sales/products           Product & Stock
/sales/orders             Orders & Payments
/sales/slips              Payment Slip Review
/campaigns                Campaign Automation
/route-planner            AI Route Planner
/integrations/ai          AI API Providers
/integrations/chat        Chat API Integrations
/integrations/webhook     Webhook Tester
/integrations/notifications  Owner Notifications
/admin/secrets            Settings & Secrets Vault
/admin/roles              Role & Permission Management
/admin/security           Security Settings
/admin/backup             Backup & Export
/logs/audit               Audit Logs
/logs/usage               Usage Logs
/logs/errors              Error Logs
```

## File structure

```
src/
  routes/
    __root.tsx                (already exists — keep shell)
    _app.tsx                  (AppLayout wrapper with Outlet)
    _app.index.tsx            (Dashboard)
    _app.inbox.tsx
    _app.crm.tsx
    _app.setup.workspace.tsx
    _app.setup.invite.tsx
    _app.setup.login-preview.tsx
    _app.ai.inquiries.tsx
    _app.ai.visual-catalog.tsx
    _app.ai.knowledge-files.tsx
    _app.ai.training.tsx
    _app.ai.feedback.tsx
    _app.ai.preferences.tsx
    _app.sales.bookings.tsx
    _app.sales.products.tsx
    _app.sales.orders.tsx
    _app.sales.slips.tsx
    _app.campaigns.tsx
    _app.route-planner.tsx
    _app.integrations.ai.tsx
    _app.integrations.chat.tsx
    _app.integrations.webhook.tsx
    _app.integrations.notifications.tsx
    _app.admin.secrets.tsx
    _app.admin.roles.tsx
    _app.admin.security.tsx
    _app.admin.backup.tsx
    _app.logs.audit.tsx
    _app.logs.usage.tsx
    _app.logs.errors.tsx
  components/
    layout/        AppLayout, Sidebar, Header, PageContainer
    common/        StatusBadge, DataTable, Modal, Drawer, MetricCard,
                   ProviderCard, IntegrationCard, ActionButton
    copilot/       AICopilotDrawer + floating trigger
    pages/         28 page components (DashboardPage.tsx, etc.) — routes are thin
                   wrappers that render these so the requested file list exists
  data/mockData.ts
  types/index.ts
  services/
    mockActions.ts, aiGateway.ts, supabaseClient.ts, lineService.ts,
    telegramService.ts, metaService.ts, whatsappService.ts, routeService.ts,
    paymentService.ts, storageService.ts, auditService.ts
  store/useAppStore.ts       (zustand — holds mock arrays so mutations propagate)
  utils/formatters.ts, permissions.ts, constants.ts
  styles.css                 (extend with Sarabun font, teal tokens)
```

## Design system

- Update `src/styles.css`: load Inter + Sarabun via a `<link>` in `__root.tsx` head; override semantic tokens to dark slate (`--background: slate-950`, cards `slate-900`, borders `slate-800`); add teal primary (`oklch` of `#14b8a6`). Status colors mapped to chart tokens for badges (success / warning / danger / info / muted).
- `StatusBadge`, `MetricCard`, `DataTable`, etc. all consume tokens — no hardcoded hex in components.

## Mock state & actions

- `useAppStore` (zustand) seeds from `mockData.ts` and exposes the full action list from the brief (notifyOwner, createBookingFromInquiry, approvePaymentSlip, sendWebhookEvent, etc.).
- Every action: updates store, appends an entry to `auditLogs` / `usageLogs` / `ownerNotificationLogs` where relevant, fires a sonner toast in Thai.
- `mockActions.ts` re-exports thin wrappers around the store so pages stay framework-agnostic.

## AI Copilot

Floating teal button bottom-right inside `AppLayout`; opens a right-side `Drawer` with chat transcript, text input, mock image attach, "Add to Visual Catalog" simulation, "Link with Telegram" mock button. Adding a catalog item from Copilot calls `addCatalogItemFromCopilot` so the Visual Catalog page reflects it.

## Integration placeholders

Each service file exports stub functions returning `Promise.reject(new Error("not implemented"))` or mock data, with a top-of-file comment:
`// Production integration will be implemented in a later phase. Do not place secrets in frontend.`

No real fetch calls to Gemini / LINE / Telegram / Meta / WhatsApp / payments / routing. `supabaseClient.ts` exports a `null` placeholder with a TODO comment (the integration-managed Supabase files already in the template are left untouched but not used for app data in Phase 1).

## Out of scope (Phase 2+)

Real Supabase tables, edge functions, AI gateway, channel webhooks, payment provider, routing API, NAS backup wiring, auth.

## Acceptance

- App builds and runs, every sidebar link routes to its page
- All 28 pages render with mock data from the central store
- Major buttons mutate the store and show toasts
- Copilot drawer opens, accepts input, can add a catalog item
- No real API keys, no real external API calls from the frontend
- Dark slate / teal visual identity matches the prototype, Thai labels preserved
