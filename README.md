# Empowered Cooks KPI Tracker

Public product-performance tracker with owner-only editing, backed by a shared D1 database. Retains the original HTML tracker interface and the supplied backup through August 2026.

## Use

Visitors can view history, charts and reports without signing in. The owner selects **Owner sign in** and uses the ChatGPT account configured for this Site. Weekly numeric fields and placement notes autosave after a short pause; the status changes to **All changes saved** after the server confirms persistence. Product/settings controls retain their explicit Save buttons. Public views refresh every 15 seconds.

If a save fails or another tab has changed the same history, the app keeps the input and shows a warning. Download a JSON backup before reloading to reconcile a conflict. JSON and CSV exports remain available.

## Architecture

- `lib/tracker-html.ts`: retained HTML/CSS/JavaScript interface and autosave client.
- `app/route.ts`: serves the tracker.
- `app/api/state/route.ts`: authenticated writes, origin checks and optimistic concurrency.
- `lib/shared-store.ts`: prepared D1 statements and idempotent initial data loading.
- `lib/seed.json`: initial supplied backup; never replaces existing database values.
- `db/schema.ts` and `drizzle/`: database schema and generated migrations.
- `app/chatgpt-auth.ts`: platform-managed ChatGPT sign-in.

The hosted runtime must set `TRACKER_OWNER_EMAIL` to the verified Site owner's sign-in email. It is kept outside the repository. Missing configuration denies all writes. Hosting must authenticate and sanitize the identity headers; do not expose this Worker directly behind an untrusted proxy.

## Build and verify

Use Node 22.13+ and the pnpm version declared in package.json. Run `pnpm install --frozen-lockfile`, `pnpm build`, and `node tests/shared-store.cjs`. D1 migrations are applied by Sites during publication. Code is maintained in this GitHub repository; publishing also requires the Sites build/deployment flow. Pushing to GitHub alone does not deploy this app.
