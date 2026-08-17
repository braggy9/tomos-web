# Training Radar

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
- An event must have passed and contain a recognised training marker such as
  Greta, strength, Car Park, Pilates, easy, tempo, intervals, hills, or a
  training emoji.
- Results are sorted oldest first. Counts cover every matching item; the first
  six are displayed.
- Calendar training events with a passed date but neither planned nor done
  colour are surfaced as `status unclear` for manual review.
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

Never commit either secret. Production values live in Vercel; the human-facing
password is also stored in Tom's local macOS Keychain.

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
  `e22099b46e06892061e437945b1e3369438a1495`.
- The detector showed two overdue strength sessions, dated 12 and 16 August.
- A planned 11 August run was initially a false positive. Same-day Strava
  reconciliation removed it after confirming the completed 8 km run.
- Race gaps were zero; all races inside 60 days had confirmed registration.
- Recovery was stale, with the latest check-in dated 6 July.
- Strava sync was current after a protected 14-day catch-up; the seven-day tile
  showed 37.2 km across three sessions.
- Authenticated desktop and 390px mobile production checks passed without
  horizontal overflow or layout collisions.

This snapshot is release evidence, not permanent current-state data. Recheck the
live surface before reporting today's training status.

## Known Limitations

- Calendar colour and title conventions are manual and can produce exceptions.
- Reconciliation is intentionally conservative, but Calendar titles and Strava
  activity names are still free text and may require manual review.
- Recovery capture is external to the radar. The radar only reads and warns.
- The first six slipped sessions, unclear Calendar items, and race gaps are
  displayed; full matching counts remain visible in their tiles.
