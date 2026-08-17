import { describe, expect, it } from "vitest";
import {
  classifySessionTypes,
  isConfirmedRegistration,
  plannedDistanceRange,
  reconcileRunSessions,
  sydneyDateKey,
  sydneyDayDiff,
  type ReconciliationActivity,
  type ReconciliationCandidate,
} from "./trainingRadarLogic";

const activity = (overrides: Partial<ReconciliationActivity> = {}): ReconciliationActivity => ({
  id: "activity-1",
  date: "2026-08-05T08:00:00+10:00",
  type: "run",
  distance: 8,
  activityName: "Morning Run",
  ...overrides,
});

const candidate = (overrides: Partial<ReconciliationCandidate> = {}): ReconciliationCandidate => ({
  id: "calendar-1",
  title: "Easy 7-8km",
  start: "2026-08-05T06:00:00+10:00",
  sessionTypes: ["run"],
  ...overrides,
});

describe("classifySessionTypes", () => {
  it("keeps every component of a combined training plan", () => {
    expect(classifySessionTypes({ summary: "Easy 7-8km + gym + Pilates" })).toEqual([
      "strength",
      "recovery",
      "run",
    ]);
  });

  it("does not mistake the coach name or a rest instruction for strength or running", () => {
    expect(classifySessionTypes({ summary: "REST + CARB LOAD | Greta Wk12" })).toEqual([]);
    expect(classifySessionTypes({ summary: "Easy 7-8km | Greta Wk14" })).toEqual(["run"]);
  });
});

describe("reconcileRunSessions", () => {
  it("matches a compatible same-day run with the planned distance", () => {
    expect(reconcileRunSessions([candidate()], [activity()]).matchedIds).toContain("calendar-1");
  });

  it("does not let a short run clear a planned long run", () => {
    const result = reconcileRunSessions(
      [candidate({ title: "Long run 20km", sessionTypes: ["long run"] })],
      [activity({ type: "long run", distance: 3 })]
    );
    expect(result.matchedIds).not.toContain("calendar-1");
    expect(result.possibleMatchIds).toContain("calendar-1");
  });

  it("uses one Strava activity at most once", () => {
    const result = reconcileRunSessions(
      [candidate(), candidate({ id: "calendar-2" })],
      [activity()]
    );
    expect([...result.matchedIds]).toEqual(["calendar-1"]);
  });

  it("never clears mixed run and strength work from Strava alone", () => {
    const result = reconcileRunSessions(
      [candidate({ sessionTypes: ["strength", "run"] })],
      [activity()]
    );
    expect(result.matchedIds.size).toBe(0);
  });
});

describe("Sydney dates", () => {
  it("preserves date-only values", () => {
    expect(sydneyDateKey("2026-01-01")).toBe("2026-01-01");
  });

  it("counts calendar days across the daylight-saving boundary", () => {
    expect(sydneyDayDiff("2026-10-05", new Date("2026-10-03T14:30:00Z"))).toBe(1);
  });
});

describe("normalisation", () => {
  it("parses en dash distance ranges", () => {
    expect(plannedDistanceRange("Easy 7–8km")).toEqual({ min: 7, max: 8 });
  });

  it("normalises confirmed registration status", () => {
    expect(isConfirmedRegistration(" Confirmed ")).toBe(true);
  });
});
