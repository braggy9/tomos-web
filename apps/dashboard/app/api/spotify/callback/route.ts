import { NextResponse } from "next/server";
import { hasFollowReadScope, redirectUri, SPOTIFY_TOKEN_URL, verifyState } from "../../../../lib/spotifyOAuth";
import { saveSpotifyAuth } from "../../../../lib/spotifyAuthStore";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

function back(origin: string, params: Record<string, string>) {
  const url = new URL("/gigs", origin);
  for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);
  return NextResponse.redirect(url, { headers: PRIVATE_HEADERS });
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
  if (denied) return back(origin, { spotify: "denied", reason: denied });

  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) return back(origin, { spotify: "error", reason: "credentials_not_configured" });

  const verdict = verifyState(url.searchParams.get("state"), clientSecret);
  if (!verdict.valid) return back(origin, { spotify: "error", reason: `state_${verdict.reason}` });

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
  } catch (error) {
    console.error("Storing Spotify refresh token failed", error instanceof Error ? error.message : error);
    return back(origin, { spotify: "error", reason: "store_failed" });
  }

  return back(origin, { spotify: "connected" });
}
