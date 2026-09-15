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
  const base = NOTICES[status];
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
  let connection: SpotifyConnection = {
    connected: false,
    spotifyUser: null,
    connectedAt: null,
    storeConfigured,
    notice: notice(status, reason),
  };

  if (storeConfigured) {
    try {
      const stored = await readSpotifyAuth();
      if (stored) {
        connection = { ...connection, connected: true, spotifyUser: stored.spotifyUser, connectedAt: stored.connectedAt };
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
