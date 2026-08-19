import { describe, expect, it } from "vitest";
import { attractionMatchesArtist, deduplicateEvents, isNswEvent, isUpcoming, normaliseArtistName, saleNeedsAttention, type GigEvent } from "./gigRadarLogic";

const event: GigEvent = { id: "one", artistId: "artist", artistName: "Nick Cave & The Bad Seeds", name: "Live", date: "2026-09-20T10:00:00Z", venue: "Opera House", city: "Sydney", country: "Australia", ticketUrl: "https://example.com", status: "onsale", presales: [] };

describe("Gig Radar event logic", () => {
  it("normalises artist names conservatively", () => expect(normaliseArtistName("Beyoncé & JAY-Z")).toBe("beyonce and jay z"));
  it("deduplicates provider copies of the same show", () => expect(deduplicateEvents([event, { ...event, id: "two" }])).toHaveLength(1));
  it("excludes past and cancelled shows", () => {
    const now = new Date("2026-09-01T00:00:00Z");
    expect(isUpcoming(event, now)).toBe(true);
    expect(isUpcoming({ ...event, status: "cancelled" }, now)).toBe(false);
    expect(isUpcoming({ ...event, date: "2026-08-01T00:00:00Z" }, now)).toBe(false);
  });
  it("flags sales starting inside seven days", () => expect(saleNeedsAttention({ ...event, publicSaleAt: "2026-09-05T00:00:00Z" }, new Date("2026-09-01T00:00:00Z"))).toBe(true));
  it("accepts only exact normalised attraction names", () => {
    expect(attractionMatchesArtist("Beyoncé", ["Beyonce"])).toBe(true);
    expect(attractionMatchesArtist("Air", ["Air Supply", "Air tribute"])).toBe(false);
  });
  it("keeps NSW events and rejects similarly named interstate places", () => {
    expect(isNswEvent({ city: "Sydney", stateCode: "NSW" })).toBe(true);
    expect(isNswEvent({ city: "Melbourne", stateCode: "VIC" })).toBe(false);
  });
});
