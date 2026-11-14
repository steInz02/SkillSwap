# SkillSwap

**Trade skills. Grow together.**

A peer-to-peer learning platform by **Earhl Dumaquita**. Teach someone programming and learn guitar in return. SkillSwap connects people through practical, mutually agreed learning exchanges.

## What works

- Account registration, sign-in, sign-out, and persistent profiles.
- Publish skill offers with category, learner level, format, and desired skills.
- Search, category/format/level filters, and deterministic mutual-interest ranking.
- Browser-local bookmarks.
- Propose a dated exchange, accept or decline it, cancel it, and confirm completion.
- Both participants must confirm completion before either can leave a review.
- Participant-only reviews; one review per participant per exchange.
- Block members and record reports for manual database review.
- Responsive interface, keyboard-accessible forms, focus trapping in dialogs.
- Separate interactive demo with six fictional profiles and persona switching.

## Demo vs live community

The app starts in **Demo workspace**. Demo profiles, ratings, and completed counts are fictional examples, not actual users or testimonials. Demo edits and exchanges are stored only in the current browser. Switch personas in **My exchanges** to test both sides of a request.

Choose **Go to live community** to use the real database. Create an account under **My profile**, then share a skill. Live accounts, profiles, listings, proposals, reviews, blocks, and reports persist in D1. Bookmarks remain device-local. Opening a section refreshes live data; this version does not push real-time updates.

The hosted preview is private to the owner. The downloaded project runs independently on your machine; hosting it for other people is a separate step.

## Run in VS Code (Windows, macOS, Linux)

Requirements: Node.js **22.13 or newer**, npm, and VS Code. No paid API keys are needed for local development. This is a full-stack app: VS Code Live Server and opening `index.html` are not suitable.

1. Extract the ZIP and open the `SkillSwap` folder in VS Code.
2. Open **Terminal → New Terminal**.
3. Run:

```sh
npm ci
npm run build
npm run db:local
npm run dev
```

4. Open the local URL printed by the terminal, normally `http://localhost:5173`.

Keep the terminal running. Stop it with **Ctrl+C**. On later launches, only `npm run dev` is needed. The first build creates the local database configuration; `db:local` applies only migrations not already recorded locally. `.wrangler/` contains your local database and is excluded from Git.

To test real exchanges locally, create two test accounts using two browser profiles or a normal and private browser window. Each participant sees only their own exchanges. Use a future date for proposals.

## Checks

```sh
npm test
npm run test:api
npm run typecheck
npm run build
```

`test:api` runs the actual API route against a disposable Miniflare/D1 database without a preview server. It tests account registration, wrong-password rejection, listings, proposals, authorization, two-party completion, review eligibility, duplicate review prevention, blocking, and logout. It does not modify your local development or hosted database.

A separate optional test can target a disposable local preview:

```sh
node tests/api-smoke.mjs http://127.0.0.1:5173
```

That optional mode creates test records; use it only with a disposable local database.

## Stack

| Layer | Implementation |
| --- | --- |
| Interface | React, TypeScript, custom CSS, Lucide icons |
| Full-stack framework | Vinext with App Router conventions |
| Runtime | Cloudflare Workers |
| Database | Cloudflare D1 (SQLite), Drizzle schema/migrations |
| Accounts | Salted PBKDF2-SHA256 password hashes and HttpOnly sessions |
| Tests | Node test runner and Miniflare |

Fonts are loaded from Google Fonts with local system-font fallbacks. No external photos or generated image assets are required.

## Project structure

```text
app/page.tsx                 Main interface and isolated demo mode
app/globals.css              Responsive styling
app/api/[...path]/route.ts   Server API and authorization checks
lib/domain.mjs               Exchange state transitions and match scoring
db/schema.ts                 Database schema
drizzle/                     Versioned SQL migrations
scripts/migrate-local.mjs    Local database setup
tests/                       Automated checks
docs/ARCHITECTURE.md          Data model and API guide
docs/GITHUB_SETUP.md          Uploading this project to your GitHub
```

## Current boundaries

This is a working MVP for a private pilot, not a hardened public marketplace. Before inviting an unrestricted public audience, add email verification, password recovery, persistent abuse/rate limits, account deletion, a moderation dashboard, and operational backups. Password hashing uses 100,000 PBKDF2 iterations to fit the Worker runtime; evaluate a managed authentication provider for a public launch.

This version has no payments, in-app chat/video, calendar integration, file uploads, time credits, or automatic dispute resolution. Proposals carry meeting details; accept only when those details work for you. Listings can be created but not edited/deleted in the UI yet. Blocks can be removed manually by the project operator. Reports are stored, not automatically actioned. Email addresses are private account identifiers and are not exposed in public profiles. Session cookies expire after seven days; this MVP does not implement automatic cleanup of expired session records.

## GitHub

See [the step-by-step guide](docs/GITHUB_SETUP.md). Never commit `node_modules`, `.wrangler`, `.sites-runtime`, `.env` files, credentials, or generated builds. This project can be stored on GitHub, but **GitHub Pages cannot run its accounts and database API**. A Workers-compatible deployment is required for the complete live app.

## Roadmap

- [ ] Edit and archive skill offers.
- [ ] Email verification and password recovery.
- [ ] Moderation dashboard and unblock controls.
- [ ] Durable rate limiting and operational monitoring.
- [ ] Messaging and scheduling improvements.
- [ ] Time-credit exchanges after validating direct swaps.

Created by **Earhl Dumaquita**.
