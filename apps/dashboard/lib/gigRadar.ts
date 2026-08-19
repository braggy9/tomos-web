import { attractionMatchesArtist, deduplicateEvents, isNswEvent, isUpcoming, saleNeedsAttention, type GigEvent } from "./gigRadarLogic";

interface SpotifyArtist {
  id: string;
  name: string;
  imageUrl?: string;
}

interface SourceHealth {
  status: "healthy" | "degraded" | "unavailable";
  detail?: string;
  succeeded?: number;
  failed?: number;
}

export interface GigRadar {
  generatedAt: string;
  configured: boolean;
  artists: SpotifyArtist[];
  events: GigEvent[];
  saleAlerts: GigEvent[];
  sourceHealth: { spotify: SourceHealth; ticketmaster: SourceHealth };
}

async function spotifyAccessToken(): Promise<string> {
  const clientId = process.env.SPOTIFY_CLIENT_ID?.trim();
  const clientSecret = process.env.SPOTIFY_CLIENT_SECRET?.trim();
  const refreshToken = process.env.SPOTIFY_REFRESH_TOKEN?.trim();
  if (!clientId || !clientSecret || !refreshToken) throw new Error("Spotify credentials are not configured");

  const response = await fetch("https://accounts.spotify.com/api/token", {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${clientId}:${clientSecret}`).toString("base64")}`,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({ grant_type: "refresh_token", refresh_token: refreshToken }),
    cache: "no-store",
  });
  if (!response.ok) throw new Error(`Spotify token request returned ${response.status}`);
  const data = (await response.json()) as { access_token?: string };
  if (!data.access_token) throw new Error("Spotify did not return an access token");
  return data.access_token;
}

async function followedArtists(): Promise<SpotifyArtist[]> {
  const token = await spotifyAccessToken();
  const artists: SpotifyArtist[] = [];
  let url: string | null = "https://api.spotify.com/v1/me/following?type=artist&limit=50";
  while (url && artists.length < 500) {
    const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` }, cache: "no-store" });
    if (!response.ok) throw new Error(`Spotify artist request returned ${response.status}`);
    const data: {
      artists?: { items?: Array<{ id: string; name: string; images?: Array<{ url: string }> }>; next?: string | null };
    } = await response.json();
    artists.push(...(data.artists?.items ?? []).map((artist) => ({
      id: artist.id,
      name: artist.name,
      imageUrl: artist.images?.[0]?.url,
    })));
    url = data.artists?.next ?? null;
  }
  return artists;
}

export function ticketmasterEvent(item: Record<string, unknown>, artist: SpotifyArtist): GigEvent | null {
  const dates = item.dates as { start?: { dateTime?: string; localDate?: string }; status?: { code?: string } } | undefined;
  const embedded = item._embedded as { venues?: Array<Record<string, unknown>>; attractions?: Array<{ name?: string }> } | undefined;
  const attractionNames = (embedded?.attractions ?? []).flatMap((attraction) => attraction.name ? [attraction.name] : []);
  // Keyword search is only candidate discovery. Never claim an event unless the
  // provider explicitly lists the watched artist as an attraction.
  if (!attractionMatchesArtist(artist.name, attractionNames)) return null;
  const venue = embedded?.venues?.[0];
  const city = venue?.city as { name?: string } | undefined;
  const country = venue?.country as { name?: string } | undefined;
  const state = venue?.state as { stateCode?: string } | undefined;
  const sales = item.sales as {
    public?: { startDateTime?: string };
    presales?: Array<{ name?: string; startDateTime?: string; endDateTime?: string }>;
  } | undefined;
  const date = dates?.start?.dateTime ?? dates?.start?.localDate;
  if (!date || typeof item.id !== "string" || typeof item.url !== "string") return null;
  return {
    id: `ticketmaster:${item.id}`,
    artistId: artist.id,
    artistName: artist.name,
    name: typeof item.name === "string" ? item.name : artist.name,
    date,
    venue: typeof venue?.name === "string" ? venue.name : "Venue to be announced",
    city: city?.name ?? "Location to be announced",
    stateCode: state?.stateCode,
    country: country?.name ?? "",
    ticketUrl: item.url,
    status: dates?.status?.code ?? "scheduled",
    publicSaleAt: sales?.public?.startDateTime,
    presales: (sales?.presales ?? []).map((presale) => ({
      name: presale.name ?? "Presale",
      start: presale.startDateTime,
      end: presale.endDateTime,
    })),
  };
}

interface TicketmasterResult { events: GigEvent[]; succeeded: number; failed: number }

const sleep = (milliseconds: number) => new Promise((resolve) => setTimeout(resolve, milliseconds));

async function fetchTicketmaster(url: string): Promise<Response> {
  for (let attempt = 0; attempt < 3; attempt += 1) {
    const response = await fetch(url, { cache: "no-store", signal: AbortSignal.timeout(10_000) });
    if (response.ok || (response.status !== 429 && response.status < 500)) return response;
    if (attempt < 2) await sleep(Number(response.headers.get("retry-after") ?? 2 ** attempt) * 1_000);
  }
  throw new Error("Ticketmaster retries exhausted");
}

async function ticketmasterEvents(artists: SpotifyArtist[]): Promise<TicketmasterResult> {
  const apiKey = process.env.TICKETMASTER_API_KEY?.trim();
  if (!apiKey) throw new Error("Ticketmaster is not configured");
  const countryCode = process.env.GIG_RADAR_COUNTRY_CODE?.trim() || "AU";
  const stateCode = process.env.GIG_RADAR_STATE_CODE?.trim() || "NSW";
  const artistLimit = Math.min(Number(process.env.GIG_RADAR_ARTIST_LIMIT ?? 100) || 100, 500);
  const events: GigEvent[] = [];
  let succeeded = 0;
  let failed = 0;
  for (let offset = 0; offset < Math.min(artists.length, artistLimit); offset += 5) {
    const batch = await Promise.allSettled(artists.slice(offset, offset + 5).map(async (artist) => {
      const query = new URLSearchParams({ apikey: apiKey, keyword: artist.name, countryCode, stateCode, size: "20", sort: "date,asc" });
      const response = await fetchTicketmaster(`https://app.ticketmaster.com/discovery/v2/events.json?${query}`);
      if (!response.ok) throw new Error(`Ticketmaster returned ${response.status}`);
      const data = (await response.json()) as { _embedded?: { events?: Array<Record<string, unknown>> } };
      return (data._embedded?.events ?? []).map((item) => ticketmasterEvent(item, artist)).filter((event): event is GigEvent => event !== null);
    }));
    for (const result of batch) {
      if (result.status === "fulfilled") { succeeded += 1; events.push(...result.value); }
      else failed += 1;
    }
    // Ticketmaster's default limit is five requests per second.
    if (offset + 5 < Math.min(artists.length, artistLimit)) await sleep(1_050);
  }
  return { events, succeeded, failed };
}

let cached: { expiresAt: number; data: GigRadar } | undefined;

export async function getGigRadarData(now = new Date()): Promise<GigRadar> {
  if (cached && cached.expiresAt > now.getTime()) return cached.data;
  let artists: SpotifyArtist[] = [];
  let events: GigEvent[] = [];
  let spotify: SourceHealth = { status: "healthy" };
  let ticketmaster: SourceHealth = { status: "healthy" };
  try { artists = await followedArtists(); } catch (error) {
    spotify = { status: "unavailable", detail: error instanceof Error ? error.message : "Spotify request failed" };
  }
  if (spotify.status === "healthy") {
    try {
      const result = await ticketmasterEvents(artists);
      events = result.events;
      ticketmaster = {
        status: result.failed ? (result.succeeded ? "degraded" : "unavailable") : "healthy",
        detail: result.failed ? `${result.failed} artist searches failed; successful results are still shown.` : undefined,
        succeeded: result.succeeded,
        failed: result.failed,
      };
    } catch (error) {
      ticketmaster = { status: "unavailable", detail: error instanceof Error ? error.message : "Ticketmaster request failed" };
    }
  } else {
    ticketmaster = { status: "unavailable", detail: "Waiting for Spotify artist data" };
  }
  events = deduplicateEvents(events).filter((event) => isNswEvent(event) && isUpcoming(event, now)).sort((a, b) => a.date.localeCompare(b.date));
  const data = {
    generatedAt: now.toISOString(),
    configured: spotify.status === "healthy" && ticketmaster.status !== "unavailable",
    artists,
    events,
    saleAlerts: events.filter((event) => saleNeedsAttention(event, now)),
    sourceHealth: { spotify, ticketmaster },
  };
  // Do not pin a temporary credential/provider outage in memory for six hours.
  if (spotify.status === "healthy" && ticketmaster.status !== "unavailable") {
    cached = { expiresAt: now.getTime() + 6 * 60 * 60 * 1_000, data };
  }
  return data;
}
