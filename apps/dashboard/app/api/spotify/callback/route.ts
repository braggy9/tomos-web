import { NextResponse } from "next/server";
import { hasFollowReadScope, knownSpotifyError, redirectUri, SPOTIFY_NONCE_COOKIE, SPOTIFY_TOKEN_URL, stateNonce, verifyState } from "../../../../lib/spotifyOAuth";
import { cookies } from "next/headers";
import { saveSpotifyAuth } from "../../../../lib/spotifyAuthStore";
import { invalidateGigRadarCache } from "../../../../lib/gigRadar";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

/**
 * Hands the browser back to /gigs via a same-site client navigation rather than
 * an HTTP redirect.
 *
 * Spotify sends the browser here cross-site, and the dashboard session cookie
 * is sameSite: "strict". A redirect chain that began cross-site stays cross-site
 * for cookie purposes, so /gigs would not receive the session cookie and would
 * bounce the owner to the login screen — with the token stored but no
 * confirmation shown. A navigation started by this page is same-site, so the
 * session cookie is sent.
 *
 * The alternative, relaxing the session cookie to "lax", would weaken an
 * existing protection for the whole dashboard to serve one flow.
 */
function back(origin: string, params: Record<string, string>) {
  const url = new URL("/gigs", origin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  const target = escapeHtml(url.pathname + url.search);

  const html = `<!doctype html><html lang="en"><head><meta charset="utf-8">` +
    `<meta name="robots" content="noindex"><title>Spotify</title>` +
    `<meta http-equiv="refresh" content="0;url=${target}"></head>` +
    `<body><p>Returning to Gig Radar&hellip; <a href="${target}">continue</a></p>` +
    `<script>location.replace(${JSON.stringify(url.pathname + url.search)})</script>` +
    `</body></html>`;

  const response = new NextResponse(html, {
    status: 200,
    headers: { ...PRIVATE_HEADERS, "Content-Type": "text/html; charset=utf-8" },
  });
  // Always burn the nonce, success or failure: a state that reached the
  // callback must not be usable a second time.
  response.cookies.set(SPOTIFY_NONCE_COOKIE, "", { httpOnly: true, path: "/api/spotify", maxAge: 0 });
  return response;
}

/**
 * Completes the authorisation. Not session-gated — Spotify redirects the
 * browser here and cookies may not survive the round trip on every client.
 * The signed, expiring state is what proves this callback belongs to a connect
 * that the signed-in owner started.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const origin = url.origin;

  const denied = url.searchParams.get("error");
  if (denied) return back(origin, { spotify: "denied", reason: knownSpotifyError(denied) });

  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return back(origin, { spotify: "error", reason: "credentials_not_configured" });

  const state = url.searchParams.get("state");
  const verdict = verifyState(state, clientSecret);
  if (!verdict.valid) {
    // One code for every state failure. Distinguishing malformed from expired
    // from bad-signature told an anonymous prober whether a state it held was
    // still live; the specific reason goes to the logs instead.
    console.error("Spotify callback state rejected", { reason: verdict.reason });
    return back(origin, { spotify: "error", reason: "state_invalid" });
  }

  // Double-submit check: the state must have been issued to this browser, and
  // the cookie is cleared by back(), so a replay finds nothing to match.
  const cookieStore = await cookies();
  const presentedNonce = cookieStore.get(SPOTIFY_NONCE_COOKIE)?.value;
  const expectedNonce = stateNonce(state);
  if (!presentedNonce || !expectedNonce || presentedNonce !== expectedNonce) {
    console.error("Spotify callback nonce mismatch", { hadCookie: Boolean(presentedNonce) });
    return back(origin, { spotify: "error", reason: "state_invalid" });
  }

  const code = url.searchParams.get("code");
  if (!code) return back(origin, { spotify: "error", reason: "missing_code" });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri(origin),
    }),
    cache: "no-store",
    signal: AbortSignal.timeout(10_000),
  });

  if (!response.ok) {
    // Spotify's error body can name the misconfiguration (a redirect_uri
    // mismatch in particular), but it is not safe to reflect into a URL.
    console.error("Spotify token exchange failed", { status: response.status });
    return back(origin, { spotify: "error", reason: `exchange_${response.status}` });
  }

  const payload = (await response.json()) as { refresh_token?: string; scope?: string; access_token?: string };
  if (!payload.refresh_token) return back(origin, { spotify: "error", reason: "no_refresh_token" });
  if (!hasFollowReadScope(payload.scope)) return back(origin, { spotify: "error", reason: "missing_scope" });

  // Best effort: label the stored row with the account that granted access, so
  // a wrong-account connect is visible on the page rather than silent.
  let spotifyUser: string | null = null;
  if (payload.access_token) {
    try {
      const me = await fetch("https://api.spotify.com/v1/me", {
        headers: { Authorization: `Bearer ${payload.access_token}` },
        cache: "no-store",
        signal: AbortSignal.timeout(10_000),
      });
      if (me.ok) {
        const profile = (await me.json()) as { display_name?: string; id?: string };
        spotifyUser = profile.display_name || profile.id || null;
      }
    } catch {
      spotifyUser = null;
    }
  }

  try {
    await saveSpotifyAuth({ refreshToken: payload.refresh_token, scope: payload.scope ?? "", spotifyUser });
    // The account may have changed; a stale scan would contradict the page.
    invalidateGigRadarCache();
  } catch (error) {
    console.error("Storing Spotify refresh token failed", error instanceof Error ? error.message : error);
    return back(origin, { spotify: "error", reason: "store_failed" });
  }

  return back(origin, { spotify: "connected" });
}
