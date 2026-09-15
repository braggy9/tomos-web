import { cookies } from "next/headers";
import { GigRadarBoard, type SpotifyConnection } from "../../components/GigRadarBoard";
import { getGigRadarData } from "../../lib/gigRadar";
import { isSpotifyStoreConfigured, readSpotifyAuth } from "../../lib/spotifyAuthStore";
import { isValidTrainingRadarSession, TRAINING_RADAR_SESSION_COOKIE } from "../../lib/trainingRadarAuth";
import { redirect } from "next/navigation";

export const dynamic = "force-dynamic";

const NOTICES: Record<string, string> = {
  connected: "Spotify connected.",
  disconnected: "Spotify disconnected. The stored token was removed.",
  denied: "Spotify authorisation was declined.",
  error: "Spotify connection failed.",
};

/**
 * /gigs is reachable directly, so the query string is untrusted whatever the
 * callback does. Only render a reason that looks like one of our own codes.
 */
function safeReason(reason?: string): string | null {
  return reason && /^[a-z0-9_]{1,40}$/.test(reason) ? reason : null;
}

function notice(status?: string, reason?: string): string | null {
  if (!status) return null;
  // A plain object literal resolves prototype keys, so ?spotify=__proto__
  // returned an object and ?spotify=toString a function — both typed string and
  // rendered as a React child, throwing during server render.
  const base = Object.hasOwn(NOTICES, status) ? NOTICES[status] : undefined;
  if (!base) return null;
  const detail = safeReason(reason);
  return detail ? `${base} (${detail})` : base;
}

export default async function GigsPage({
  searchParams,
}: {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}) {
  const cookieStore = await cookies();
  if (!isValidTrainingRadarSession(cookieStore.get(TRAINING_RADAR_SESSION_COOKIE)?.value)) redirect("/");

  const params = (await searchParams) ?? {};
  const status = typeof params.spotify === "string" ? params.spotify : undefined;
  const reason = typeof params.reason === "string" ? params.reason : undefined;

  const storeConfigured = isSpotifyStoreConfigured();
  // Without a store the environment token is the live credential, so reporting
  // "not connected" would contradict a working scan and offer a Connect link
  // that can only fail with spotify_token_store_not_configured.
  const envTokenActive = !storeConfigured && Boolean(process.env.SPOTIFY_REFRESH_TOKEN?.trim());
  let connection: SpotifyConnection = {
    connected: envTokenActive,
    via: envTokenActive ? "environment" : "store",
    spotifyUser: null,
    connectedAt: null,
    storeConfigured,
    notice: notice(status, reason),
  };

  if (storeConfigured) {
    try {
      const stored = await readSpotifyAuth();
      if (stored) {
        connection = { ...connection, connected: true, via: "store", spotifyUser: stored.spotifyUser, connectedAt: stored.connectedAt };
      }
    } catch (error) {
      // Report the store being unreachable rather than rendering "not
      // connected", which would invite a pointless reconnect.
      connection = {
        ...connection,
        notice: connection.notice ?? `Spotify token store unavailable: ${error instanceof Error ? error.message : "unknown error"}`,
      };
    }
  }

  return <GigRadarBoard data={await getGigRadarData()} connection={connection} />;
}
