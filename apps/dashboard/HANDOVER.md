# Gig Radar — Claude Code Handover

> Last audited: 14 September 2026. Repository: `braggy9/tomos-web`.

## Start Here

Gig Radar is an authenticated, read-only Next.js MVP for finding Ticketmaster
events in Sydney and New South Wales for artists followed by one Spotify
account. It is not yet the autonomous announcement and presale alerting service
originally requested.

The current task branch includes the MVP and the clearer two-tab Training Radar
/ Gig Radar switcher. At the time of this handover:

- GitHub `main` was `3cdaae7a8f5a55eab7f86335b5666a8c254d82d6`.
- GitHub had no open pull requests.
- The task branch commit was `317a60c`.
- `https://tomos-dashboard.vercel.app/gigs` was deployed and redirected an
  anonymous request to the login page.
- `GET /api/gig-radar` returned HTTP 401 without its bearer token, as intended.
- `/api/spotify/callback` returned HTTP 404 because OAuth is not implemented.
- `RadarNav.tsx` was not present on remote `main`; updating a Codex task branch
  did not publish the local commit.

Treat these as dated observations. Re-run the commands in **Live-state audit**
before making claims about the current repository or deployment.

## Security Actions Before Provider Testing

The Spotify client secret was pasted into an earlier chat. It must be treated as
compromised. Confirm that it was rotated in Spotify and that Vercel contains only
the replacement. Never copy the replacement into chat, Git, logs, issues, or PR
text.

The Ticketmaster Discovery integration uses the **Consumer Key** only. Store it
as `TICKETMASTER_API_KEY`. The Ticketmaster Consumer Secret is unused and should
be removed from Vercel.

The dashboard password was originally added and edited through Vercel CLI and
was not reliably handed to the owner. The owner should set a known value for
`TRAINING_RADAR_PAGE_PASSWORD`, save it in a password manager, and redeploy.
Do not rotate `TRAINING_RADAR_READ_TOKEN` at the same time unless machine clients
are deliberately being updated.

## Implemented Surface

| Area | Implementation |
| --- | --- |
| Human route | `app/gigs/page.tsx`; requires the shared dashboard session |
| Machine route | `app/api/gig-radar/route.ts`; requires `TRAINING_RADAR_READ_TOKEN` |
| Aggregation | `lib/gigRadar.ts` |
| Pure event rules | `lib/gigRadarLogic.ts` |
| UI | `components/GigRadarBoard.tsx` |
| Shared navigation | `components/RadarNav.tsx` |
| Tests | `lib/gigRadarLogic.test.ts` |

Current behaviour:

1. A request to `/gigs` calls `getGigRadarData()` during server rendering.
2. Spotify client credentials and a pre-generated refresh token are exchanged
   for an access token.
3. Up to 500 followed artists are imported; Ticketmaster checks 100 by default.
4. Ticketmaster candidate searches are limited to `AU` and `NSW`, paced in
   batches of five, timed out after ten seconds, and retried for transient errors.
5. An event is accepted only when Ticketmaster explicitly embeds an attraction
   whose normalised name exactly matches the watched artist.
6. Results are deduplicated, restricted to upcoming NSW events, sorted, and
   classified for sale activity within seven days.
7. A successful result is cached for six hours in warm-process memory only.
8. Provider errors are exposed as `degraded` or `unavailable`; they are not
   converted into an apparently successful empty result.

## Required Vercel Configuration

Set these on the Vercel project serving `tomos-dashboard.vercel.app` and apply
them to Production. Redeploy after changing them.

```text
SPOTIFY_CLIENT_ID
SPOTIFY_CLIENT_SECRET
SPOTIFY_REFRESH_TOKEN
TICKETMASTER_API_KEY
GIG_RADAR_COUNTRY_CODE=AU
GIG_RADAR_STATE_CODE=NSW
GIG_RADAR_ARTIST_LIMIT=100
TRAINING_RADAR_PAGE_PASSWORD
TRAINING_RADAR_READ_TOKEN
```

`SPOTIFY_REFRESH_TOKEN` must belong to the configured Spotify application and
have `user-follow-read`. Client ID plus client secret is insufficient in the
current implementation.

Do not create `NEXT_PUBLIC_` versions of credentials. All provider credentials
are server-only.

## Known Gaps and Risks

### Product gaps

- No Connect Spotify button, OAuth start route, callback, state validation,
  reconnect, or disconnect workflow.
- Only followed Spotify artists are imported; saved-album artists, priorities,
  ignored artists, aliases, and manual artists are absent.
- No durable datastore. There is no `firstSeenAt`, change history, scan history,
  notification history, or durable source health.
- No scheduler. Opening `/gigs` or reading its API performs provider work.
- No push, email, calendar, presale, or public-sale notification delivery.
- No interested, dismissed, wrong-artist, or tickets-bought actions.
- No reliable definition of newly announced, detection-missed, or passed-without-
  action events because no history is retained.
- Ticketmaster is the only event source.
- Location relevance is state-wide rather than based on home coordinates,
  radius, venue, or artist priority.

### Engineering risks

- Warm-instance memory caching is not shared, durable, or guaranteed across
  serverless instances.
- A cold page request can issue up to 100 Ticketmaster calls and may exceed a
  serverless request duration despite pacing.
- Exact attraction-name matching limits false positives but creates false
  negatives for aliases and provider naming differences.
- Deduplication uses artist, venue, and minute-level event time rather than a
  persisted canonical identity across providers.
- `Retry-After` parsing assumes a numeric seconds value and does not support an
  HTTP-date value.
- No mocked provider integration tests cover pagination, HTTP failures,
  timeouts, rate limits, malformed payloads, or partial batch success.

## Definition of Done

### Phase 1: read-only MVP closeout

Do not describe Phase 1 as production-verified until all of these are true:

- The task branch is pushed and a PR containing `RadarNav.tsx` is merged.
- A new Vercel deployment is built from that merge.
- The owner can log in with a known `TRAINING_RADAR_PAGE_PASSWORD`.
- Spotify reports healthy and imports more than zero expected artists.
- Ticketmaster reports healthy or explicitly degraded, not unavailable.
- At least five returned events—or every event if fewer—are manually checked
  against Ticketmaster for artist, venue, NSW location, date, and ticket URL.
- At least five watched artists with known NSW events/non-events are checked for
  false negatives and false positives.
- Desktop and 390px mobile navigation are visually checked.
- The production verification date, deployment commit, counts, and observed
  limitations are recorded in this handover without secrets.

### Phase 2: original alerting objective

The original product is done only when it also has:

- Secure Spotify OAuth with durable encrypted refresh-token storage.
- Durable watched artists, mappings, canonical events, sale/status history,
  scan runs, decisions, and notification deliveries.
- Scheduled scans that do not depend on opening the page.
- Idempotent new-event, presale, public-sale, cancellation, and postponement
  notifications.
- Sydney/radius preferences and artist-level priorities.
- A second verified event source with cross-provider deduplication.
- A monitored observation period demonstrating acceptable false-positive,
  false-negative, duplicate, and notification rates.

## Recommended Implementation Order

1. **Publish the existing branch.** Bring it onto current `main`, resolve any
   conflict, run all checks, create a PR, and deploy after review.
2. **Verify provider configuration.** Do not add features until the existing
   Spotify and Ticketmaster path has been exercised with real production data.
3. **Add Spotify OAuth.** Implement authenticated connect/callback/disconnect
   routes with signed, expiring state and protected token storage.
4. **Choose durable storage.** Prefer the existing TomOS backend if it is the
   intended system of record; otherwise document and migrate a dashboard-owned
   database before adding data-dependent UI.
5. **Persist reconciliation.** Store watched artists, stable Ticketmaster
   attraction mappings, canonical events, provider references, timestamps,
   status/sale history, and scan runs. Make rescans idempotent.
6. **Move scanning off page reads.** Add a protected scheduled operation with a
   real rate limiter, quota telemetry, partial success, and retry policy.
7. **Add notifications.** Reuse the existing TomOS APNs path if still current.
   Use deterministic delivery keys to prevent duplicates.
8. **Add decisions and preferences.** Implement priority, ignore, interested,
   dismissed, purchased, wrong-match, home radius, and travel overrides.
9. **Add a second provider.** Verify present-day API access, Australian coverage,
   rate limits, and terms before selecting it.
10. **Observe before enabling alerts.** Run silently, compare against known
    Sydney/NSW listings, then enable notifications after matching is trusted.

## Live-state Audit

Run from an authenticated clone:

```bash
git status --short --branch
git remote -v
git fetch origin --prune
git log --oneline --decorate -5
gh pr list --repo braggy9/tomos-web --state all --limit 10
gh pr checks PR_NUMBER --repo braggy9/tomos-web
curl -sS -o /dev/null -w '%{http_code}\n' https://tomos-dashboard.vercel.app/gigs
curl -sS -o /dev/null -w '%{http_code}\n' https://tomos-dashboard.vercel.app/api/gig-radar
curl -sS -o /dev/null -w '%{http_code}\n' https://tomos-dashboard.vercel.app/api/spotify/callback
```

Expected anonymous responses are a redirect for `/gigs`, 401 for
`/api/gig-radar`, and—until OAuth is implemented—404 for the Spotify callback.

For an authorised structural check, set the token only in the local shell and
do not paste it into chat:

```bash
curl -sS \
  -H "Authorization: Bearer $TRAINING_RADAR_READ_TOKEN" \
  https://tomos-dashboard.vercel.app/api/gig-radar |
  jq '{
    configured,
    generatedAt,
    artistCount: (.artists | length),
    eventCount: (.events | length),
    saleAlertCount: (.saleAlerts | length),
    sourceHealth
  }'
```

## Development and Release Commands

From the monorepo root:

```bash
pnpm install --frozen-lockfile
pnpm --filter @tomos/dashboard test
pnpm --filter @tomos/dashboard typecheck
pnpm --filter @tomos/dashboard build
git diff --check
```

For a perceptible UI change, run the dashboard on port 3009 and capture both a
desktop and 390px-wide authenticated screenshot.

Before publishing:

```bash
git fetch origin --prune
git rebase origin/main
pnpm --filter @tomos/dashboard test
pnpm --filter @tomos/dashboard typecheck
pnpm --filter @tomos/dashboard build
git diff --check
git push -u origin HEAD
gh pr create --repo braggy9/tomos-web --base main --head BRANCH
```

Do not merge without checking CI and unresolved review comments. Do not claim
the deployed integration works merely because the build succeeds.

## Suggested Claude Code Prompt

```text
Read CLAUDE.md, apps/dashboard/README.md, and apps/dashboard/HANDOVER.md first.
Audit GitHub, the current branch, and production before editing. Never expose or
print secrets. First close out Phase 1: publish the navigation change, run the
dashboard tests/typecheck/build, create a PR, inspect CI, and verify the deployed
authenticated Gig Radar with real Spotify and Ticketmaster health. Record dated
evidence without claiming missing capabilities. Do not merge or rotate secrets
without explicit approval. After Phase 1 is verified, propose the smallest
vertical slice for Spotify OAuth plus durable storage and wait for approval.
```

## Handover Principle

Keep three states separate in every update:

1. **Implemented locally** — code exists in a workspace.
2. **Merged/deployed** — code exists on `main` or Vercel.
3. **Production-verified** — authenticated real-provider behaviour was tested.

Passing unit tests proves none of the latter two states by itself.
