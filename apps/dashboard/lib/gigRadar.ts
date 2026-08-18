import { deduplicateEvents, isUpcoming, saleNeedsAttention, type GigEvent } from "./gigRadarLogic";

interface SpotifyArtist {
  id: string;
  name: string;
  imageUrl?: string;
}

interface SourceHealth {
  status: "healthy" | "unavailable";
  detail?: string;
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

function ticketmasterEvent(item: Record<string, unknown>, artist: SpotifyArtist): GigEvent | null {
  const dates = item.dates as { start?: { dateTime?: string; localDate?: string }; status?: { code?: string } } | undefined;
  const embedded = item._embedded as { venues?: Array<Record<string, unknown>> } | undefined;
  const venue = embedded?.venues?.[0];
  const city = venue?.city as { name?: string } | undefined;
  const country = venue?.country as { name?: string } | undefined;
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

async function ticketmasterEvents(artists: SpotifyArtist[]): Promise<GigEvent[]> {
  const apiKey = process.env.TICKETMASTER_API_KEY?.trim();
  if (!apiKey) throw new Error("Ticketmaster is not configured");
  const countryCode = process.env.GIG_RADAR_COUNTRY_CODE?.trim() || "AU";
  const batches: GigEvent[][] = [];
  for (let offset = 0; offset < artists.length; offset += 5) {
    const batch = await Promise.all(artists.slice(offset, offset + 5).map(async (artist) => {
      const query = new URLSearchParams({ apikey: apiKey, keyword: artist.name, countryCode, size: "20", sort: "date,asc" });
      const response = await fetch(`https://app.ticketmaster.com/discovery/v2/events.json?${query}`, { cache: "no-store" });
      if (!response.ok) throw new Error(`Ticketmaster returned ${response.status}`);
      const data = (await response.json()) as { _embedded?: { events?: Array<Record<string, unknown>> } };
      return (data._embedded?.events ?? []).map((item) => ticketmasterEvent(item, artist)).filter((event): event is GigEvent => event !== null);
    }));
    batches.push(batch.flat());
  }
  return batches.flat();
}

export async function getGigRadarData(now = new Date()): Promise<GigRadar> {
  let artists: SpotifyArtist[] = [];
  let events: GigEvent[] = [];
  let spotify: SourceHealth = { status: "healthy" };
  let ticketmaster: SourceHealth = { status: "healthy" };
  try { artists = await followedArtists(); } catch (error) {
    spotify = { status: "unavailable", detail: error instanceof Error ? error.message : "Spotify request failed" };
  }
  if (spotify.status === "healthy") {
    try { events = await ticketmasterEvents(artists); } catch (error) {
      ticketmaster = { status: "unavailable", detail: error instanceof Error ? error.message : "Ticketmaster request failed" };
    }
  } else {
    ticketmaster = { status: "unavailable", detail: "Waiting for Spotify artist data" };
  }
  events = deduplicateEvents(events).filter((event) => isUpcoming(event, now)).sort((a, b) => a.date.localeCompare(b.date));
  return {
    generatedAt: now.toISOString(),
    configured: spotify.status === "healthy" && ticketmaster.status === "healthy",
    artists,
    events,
    saleAlerts: events.filter((event) => saleNeedsAttention(event, now)),
    sourceHealth: { spotify, ticketmaster },
  };
}
