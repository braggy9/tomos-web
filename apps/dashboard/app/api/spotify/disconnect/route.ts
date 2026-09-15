import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { clearSpotifyAuth } from "../../../../lib/spotifyAuthStore";
import { isValidTrainingRadarSession, TRAINING_RADAR_SESSION_COOKIE } from "../../../../lib/trainingRadarAuth";

export const dynamic = "force-dynamic";

const PRIVATE_HEADERS = { "Cache-Control": "no-store", "X-Robots-Tag": "noindex" };

/** Removes the stored refresh token. POST-only so a link preview cannot trigger it. */
export async function POST(request: Request) {
  const cookieStore = await cookies();
  if (!isValidTrainingRadarSession(cookieStore.get(TRAINING_RADAR_SESSION_COOKIE)?.value)) {
    return NextResponse.json({ error: "spotify_disconnect_unauthorized" }, { status: 401, headers: PRIVATE_HEADERS });
  }
  try {
    await clearSpotifyAuth();
  } catch (error) {
    console.error("Clearing Spotify refresh token failed", error instanceof Error ? error.message : error);
    return NextResponse.json({ error: "spotify_disconnect_failed" }, { status: 500, headers: PRIVATE_HEADERS });
  }
  return NextResponse.redirect(new URL("/gigs?spotify=disconnected", new URL(request.url).origin), { headers: PRIVATE_HEADERS });
}
