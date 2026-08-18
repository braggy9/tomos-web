export interface GigEvent {
  id: string;
  artistId: string;
  artistName: string;
  name: string;
  date: string;
  venue: string;
  city: string;
  country: string;
  ticketUrl: string;
  status: string;
  publicSaleAt?: string;
  presales: Array<{ name: string; start?: string; end?: string }>;
}

export function normaliseArtistName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLocaleLowerCase("en-AU")
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, " ")
    .trim();
}

export function deduplicateEvents(events: GigEvent[]): GigEvent[] {
  const seen = new Set<string>();
  return events.filter((event) => {
    const key = [
      normaliseArtistName(event.artistName),
      normaliseArtistName(event.venue),
      event.date.slice(0, 16),
    ].join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

export function isUpcoming(event: GigEvent, now = new Date()): boolean {
  const date = new Date(event.date);
  return !Number.isNaN(date.valueOf()) && date >= now && event.status !== "cancelled";
}

export function saleNeedsAttention(event: GigEvent, now = new Date()): boolean {
  const windowEnd = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
  return [event.publicSaleAt, ...event.presales.map((presale) => presale.start)].some((value) => {
    if (!value) return false;
    const date = new Date(value);
    return date >= now && date <= windowEnd;
  });
}
