import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { authorizeUrl, createState, redirectUri, SPOTIFY_NONCE_COOKIE, stateNonce } from "../../../../lib/spotifyOAuth";
import { isValidTrainingRadarSession, TRAINING_RADAR_SESSION_COOKIE } from "../../../../lib/trainingRadarAuth";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

/**
 * Starts the Spotify authorisation. Session-gated: only the signed-in dashboard
 * owner may begin a connect, so an anonymous visitor cannot bind their own
 * Spotify account to this deployment.
 */
export async function GET(request: Request) {
  const cookieStore = await cookies();
  if (!isValidTrainingRadarSession(cookieStore.get(TRAINING_RADAR_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "spotify_connect_unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }

  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  if (!clientId || !clientSecret) {
    return NextResponse.json({ error: "spotify_credentials_not_configured" }, { status: 503, headers: PRIVATE_HEADERS });
  }
  if (!process.env.DATABASE_URL?.trim()) {
    // Fail before sending the owner to Spotify: without storage the returned
    // token could not be kept, and the approval would be wasted.
    return NextResponse.json({ error: "spotify_token_store_not_configured" }, { status: 503, headers: PRIVATE_HEADERS });
  }

  const origin = new URL(request.url).origin;
  const state = createState(clientSecret);
  const target = authorizeUrl({ clientId, redirectUri: redirectUri(origin), state });

  const response = NextResponse.redirect(target, { headers: PRIVATE_HEADERS });
  // Double-submit the state's nonce. The signed state alone is a bearer
  // credential: unforgeable, but replayable by anyone who obtains it from a
  // request log, browser history or Spotify's logs within its lifetime. Pairing
  // it with an httpOnly cookie binds the callback to the browser that started
  // the connect and makes the state single-use.
  //
  // sameSite must be "lax", not "strict": the callback arrives as a cross-site
  // redirect from Spotify, and a strict cookie would not be sent. That is also
  // why the dashboard session cookie cannot serve this purpose.
  response.cookies.set(SPOTIFY_NONCE_COOKIE, stateNonce(state) ?? "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/api/spotify",
    maxAge: 600,
  });
  return response;
}
