# Training Radar

## Gig Radar MVP

The authenticated `/gigs` route imports the account's followed Spotify artists
and discovers their upcoming Sydney and New South Wales shows through Ticketmaster. It is a
live, read-only discovery surface: persistence, scheduled alerts, user event
decisions, and additional event providers remain future work.

Gig Radar fails visibly when either source is unavailable. It does not interpret
a provider failure as an empty watchlist or as no upcoming shows. The machine
endpoint at `GET /api/gig-radar` uses the existing
`TRAINING_RADAR_READ_TOKEN` bearer credential.

Additional environment variables:

```text
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
SPOTIFY_REFRESH_TOKEN
TICKETMASTER_API_KEY
GIG_RADAR_COUNTRY_CODE=AU
GIG_RADAR_STATE_CODE=NSW
GIG_RADAR_ARTIST_LIMIT=100
```

The Spotify refresh token must have the `user-follow-read` scope. Secrets remain
server-side. Spotify pagination is limited to 500 followed artists, while a scan
checks at most 100 by default. Ticketmaster searches are paced to five per second,
retried on transient failures, cached for six hours per warm server instance, and
restricted to NSW. Keyword results are accepted only when the watched artist is
explicitly listed in the event attractions. Provider partial failures are shown
as degraded without discarding successful results.

Private, read-only training attention surface deployed at
`https://tomos-dashboard.vercel.app`.

This is the only live surface in the former Command Tower dashboard. It does
not use or depend on the abandoned Lovable Command Tower at
`tomos-commandtower.lovable.app`.

## Purpose

Training Radar answers four narrow questions:

1. Which planned training sessions have passed without being marked done?
2. Is a race inside 60 days missing confirmed registration?
3. Is the latest recovery check-in current enough to trust?
4. Is Strava sync healthy, and what training actually happened this week?

It is a read-only surface. It does not edit Calendar, race, recovery, or Strava
data. A TomOS backend cron reads the protected JSON endpoint each morning and
sends an APNs alert only when a source is unavailable or an item needs attention.

## Data Flow

| Concern | Source | Behaviour |
| --- | --- | --- |
| Planned sessions | Google Calendar API | Server-side read using a service account with `calendar.readonly` scope |
| Race registration | TomOS API `/api/training/race-logistics` | Flags dated races inside 60 days unless entry status is `registered`, `confirmed`, `entered`, or `paid` |
| Recovery | TomOS API `/api/training/recovery` | Shows the latest check-in; older than 3 days is stale |
| Actual running | TomOS API running activity and stats routes | Shows the current seven-day totals and recent activities |
| Strava health | TomOS API `/api/gym/sync/strava/status` | Shows the last successful sync and its current/stale state |

Every TomOS training read uses `TOMOS_TRAINING_READ_TOKEN` in a server-side
Bearer header. Source failures are returned as explicit health states; they are
never converted into zero counts or a clear status.

The TomOS API origin is currently `https://tomos-task-api.vercel.app` and is
defined in `lib/trainingRadar.ts`.

## Slippage Rules

- Calendar colour ID `10` means planned and colour ID `8` means done.
- General training sessions are inspected over the trailing 14 days.
- Strength sessions are inspected over 30 days so recurring strength slippage
  remains visible longer.
- An event must have passed and its title must contain a recognised training
  marker such as strength, Car Park, Pilates, easy, tempo, intervals, hills,
  or a training emoji. Description text is not used for classification.
- Results are sorted oldest first. Counts cover every matching item; the first
  six are displayed.
- Managed training events (`Greta Wk...` or Car Park Strength) with a passed
  date but neither planned nor done colour are surfaced as `status unclear`
  for manual review. Other calendar entries are excluded.
- A run-only Calendar item is removed from the slipped list only when an unused
  same-day Strava activity also matches the planned run type and any distance
  stated in the Calendar title.
- Strava reconciliation applies only to run, tempo, intervals, long-run, and
  hill sessions. It never clears strength, recovery, or mixed sessions.

The colour rule is a verified Tom-side convention, not a Google Calendar state
machine. Exceptions must be corrected in Calendar or handled explicitly in the
detector; do not silently broaden the rule.

## Authentication And Privacy

The page and JSON API have separate access paths:

- `TRAINING_RADAR_PAGE_PASSWORD` protects the browser page. A successful login
  creates a secure, HTTP-only, SameSite Strict session cookie for 30 days.
- `TRAINING_RADAR_READ_TOKEN` protects `GET /api/training-radar`. Use an
  `Authorization: Bearer` header for machine access. URL query tokens are not
  accepted.
- Page and machine credentials are deliberately separate. If no page password
  is configured, the page fails closed.
- Failed browser logins are rate-limited after five attempts in 15 minutes.
- The unauthenticated page does not fetch or render radar data.
- Page responses are private and non-cacheable. The service worker does not
  cache authenticated HTML. Search indexing is disabled.

Never commit either secret. Production values live in Vercel. The human-facing
password was rotated on 19 August 2026 and the matching value is stored in
Tom's macOS Keychain under service `TRAINING_RADAR_PAGE_PASSWORD`, account
`tomos`.

Required dashboard environment variables:

```text
GOOGLE_SERVICE_ACCOUNT
GOOGLE_CALENDAR_ID
TRAINING_RADAR_PAGE_PASSWORD
TRAINING_RADAR_READ_TOKEN
TOMOS_TRAINING_READ_TOKEN
RECOVERY_LOG_TOKEN
```

`GOOGLE_SERVICE_ACCOUNT` is the complete JSON service-account object. The
configured calendar must be shared read-only with its `client_email`.

Recovery capture is a two-token server-side chain. `/api/recovery-log`
validates `RECOVERY_LOG_TOKEN` from the capture client, then uses
`TOMOS_TRAINING_READ_TOKEN` as a bearer credential for the protected TomOS
recovery write. Neither credential belongs in browser code.

## Local Verification

From the monorepo root:

```bash
pnpm --filter @tomos/dashboard typecheck
pnpm --filter @tomos/dashboard test
pnpm --filter @tomos/dashboard build
pnpm --filter @tomos/dashboard dev
```

The local app runs on `http://localhost:3009`.

## Production Verification

After any behavioural or authentication change:

1. Confirm unauthenticated `/` shows only the login surface and returns a
   private, no-store cache policy.
2. Confirm unauthenticated `/api/training-radar` returns HTTP 401.
3. Sign in through the production page and inspect all four tiles.
4. Check desktop and a 390px-wide mobile viewport for overflow and collisions.
5. Compare slipped sessions with Calendar and same-day Strava activities.
6. Record what was caught, what was excluded, and any false positives or false
   negatives.

### Verification snapshot: 17 August 2026

- Production was built from `tomos-web` main commit
  `c3fb7dd9bee513627c0159c62e5c920c50caa64e`; protected upstream reads were
  deployed from `TomOS` main commit `8fa78669f9e33f22bb669f7246faf990fb52b9e4`.
- The detector showed two overdue mixed run, strength, and recovery sessions,
  dated 12 and 16 August. A completed run does not clear their other planned
  components.
- A planned 11 August run was reconciled after Strava confirmed the completed
  8 km run, so it was correctly excluded from the open list.
- Race gaps were zero; all races inside 60 days had confirmed registration.
- Recovery was stale, with the latest check-in dated 6 July.
- Strava sync was current after a protected 14-day catch-up; the seven-day tile
  showed 37.2 km across three sessions.
- Authenticated desktop and 390px mobile production checks passed without
  horizontal overflow or layout collisions.
- Anonymous dashboard and upstream API reads returned HTTP 401; bearer reads
  returned HTTP 200, and URL query-token access remained disabled.
- The production monitor sent one successful APNs alert containing the two
  slipped sessions and stale recovery warning.
- No false positives or false negatives were found in the inspected 14-day
  sample. Mixed sessions remain deliberately conservative pending evidence for
  every planned component.

This snapshot is release evidence, not permanent current-state data. Recheck the
live surface before reporting today's training status.

### Release completion: 18 August 2026

- [PR #14](https://github.com/braggy9/tomos-web/pull/14), commit
  `c0a41d3ce6a10c5fd4f7764e3ac3e76c67e4caa5`, was deployed from a clean
  worktree and verified on production deployment
  `dpl_4yMLu6qUQwXa63VoisNBCUdTuVzD`.
- The Slipped Sessions tile correctly showed `2 strength` for the two open
  mixed strength, recovery, and run sessions dated 12 and 16 August.
- The page-password login succeeded. Anonymous page content contained only the
  login form, the unauthenticated radar API returned HTTP 401, and private
  responses remained non-cacheable.
- Authenticated desktop (1512px) and mobile (390px) checks passed without
  clipping or horizontal overflow. The protected API returned HTTP 200 with
  all six sources healthy.
- No detector-level false positive was found against the green-Calendar
  contract. The 16 August run component was recorded as completed in the
  Training Hub, but the mixed event remained green and its strength/recovery
  components were unconfirmed, so retaining it as an attention item was
  deliberate.

### Post-release audit: 19 August 2026

- The protected production API returned HTTP 200 with `degraded: false`; all
  six source-health checks remained healthy.
- The same two mixed sessions remained open, now 7 and 3 days overdue. No
  managed events needed status classification.
- Hounslow 17km was the next race at 25 days, with registration confirmed and
  zero race gaps inside the 60-day window.
- Recovery remained stale at 44 days. Strava's scheduled sync succeeded on
  19 August Sydney time and remained current; the trailing-seven-day context
  was 39.2 km across three sessions.
- The first real recovery check-in remains pending. There is no currently
  deployed TomOS MCP connector: the retained authenticated capture path is the
  dashboard `/api/recovery-log` proxy. Treat the first check-in as release
  verification, then observe seven days of capture and APNs reminder behaviour
  before deciding whether another prompt mechanism is needed. Do not build
  trend views or load joins until real recovery data exists consistently.

These figures are another dated audit, not live documentation. Use the
authenticated production endpoint for current counts.

### Recovery security release: 19 August 2026

- [tomos-web PR #17](https://github.com/braggy9/tomos-web/pull/17), merge
  `728252cfb98836ac3c9a286f855ae9763576abca`, deployed the authenticated
  recovery-capture proxy first as production deployment
  `dpl_9MqcXfcP2SES172cwx7bPYbHKY8f`.
- [TomOS PR #12](https://github.com/braggy9/TomOS/pull/12), merge
  `0bc9e1db287f801859045f0a68f1a30848e92fcd`, then protected the six raw
  recovery-bearing backend routes in production deployment
  `dpl_CNv1wnB1RmfTzyjxDZnHpGtCKsed`.
- Anonymous requests to all six routes returned HTTP 401. Authenticated reads
  returned HTTP 200; an authenticated score outside the 1-5 range returned
  HTTP 400 and left the recovery row count unchanged at two.
- The protected Radar remained non-degraded with all six sources healthy and
  continued to surface the two mixed strength, recovery, and run sessions.
- The retired Fitness PWA's direct browser calls to those routes now return
  HTTP 401 by design. It needs a server-authenticated proxy before reuse.
- The page password was rotated into Vercel and macOS Keychain, then production
  was rebuilt as `dpl_9rFzqjqUKjayKXn7V6tfHNNmj6bs`. Authenticated Playwright
  checks passed at 1512 x 900 and 390 x 844 with the `2 strength` tile visible
  and no horizontal overflow.

## Known Limitations

- Calendar colour and title conventions are manual and can produce exceptions.
- Reconciliation is intentionally conservative, but Calendar titles and Strava
  activity names are still free text and may require manual review.
- Recovery capture is external to the radar. The radar only reads and warns;
  its stale-recovery APNs alert is a lagging detector whose adoption effect must
  be demonstrated over the seven-day check.
- The first six slipped sessions, unclear Calendar items, and race gaps are
  displayed; full matching counts remain visible in their tiles.
