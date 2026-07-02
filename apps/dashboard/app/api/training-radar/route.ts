import { NextResponse } from "next/server";
import {
  fetchCalendarEvents,
  getAccessToken,
  getCalendarConfig,
  type GoogleCalendarEvent,
} from "../../../lib/googleCalendar";

const API = "https://tomos-task-api.vercel.app";
const PLANNED_COLOR_ID = "10";
const DONE_COLOR_ID = "8";
const DEFAULT_LOOKBACK_DAYS = 14;
const STRENGTH_AUDIT_DAYS = 30;
const RACE_RADAR_DAYS = 60;

interface RaceApiRace {
  id: string;
  name: string;
  shortName?: string;
  date: string | null;
  dateDisplay?: string;
  distance?: string;
  entryStatus?: string | null;
  logisticsStatus?: string | null;
  daysOut?: number | null;
  isARace?: boolean;
}

interface RecoveryData {
  sleepQuality: number;
  soreness: number;
  energy: number;
  motivation: number;
  hoursSlept: number | null;
  date: string;
  notes: string | null;
  readinessScore: number | null;
}

interface RunningStats {
  last7Days?: {
    totalDistance?: number;
    totalDuration?: number;
    trainingLoad?: number;
    sessions?: number;
  };
}

interface RunActivity {
  id: string;
  date: string;
  type: string;
  distance: number;
  duration: number;
  avgPace: number | null;
  activityName: string | null;
}

function clampNumber(value: string | null, fallback: number, min: number, max: number): number {
  if (!value) return fallback;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(Math.max(Math.round(parsed), min), max);
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function dayDiff(targetDate: string, now: Date): number {
  const target = new Date(`${targetDate}T00:00:00+10:00`);
  const today = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  target.setHours(0, 0, 0, 0);
  today.setHours(0, 0, 0, 0);
  return Math.ceil((target.getTime() - today.getTime()) / 86400000);
}

function eventTime(event: GoogleCalendarEvent, edge: "start" | "end"): string {
  const value = edge === "start" ? event.start : event.end;
  return value?.dateTime || value?.date || "";
}

function isTrainingEvent(event: GoogleCalendarEvent): boolean {
  const text = `${event.summary || ""} ${event.description || ""}`.toLowerCase();
  return [
    "greta",
    "strength",
    "car park",
    "pilates",
    "pliability",
    "long run",
    "easy",
    "tempo",
    "interval",
    "hills",
    "recovery",
    "🏃",
    "🏋",
    "🧘",
  ].some((marker) => text.includes(marker));
}

function sessionType(event: GoogleCalendarEvent): string {
  const text = `${event.summary || ""} ${event.description || ""}`.toLowerCase();
  if (text.includes("strength") || text.includes("car park") || text.includes("🏋")) {
    return "strength";
  }
  if (text.includes("pilates") || text.includes("pliability") || text.includes("mobility")) {
    return "recovery";
  }
  if (text.includes("tempo")) return "tempo";
  if (text.includes("interval")) return "intervals";
  if (text.includes("long run")) return "long run";
  if (text.includes("hills")) return "hills";
  if (text.includes("run") || text.includes("🏃")) return "run";
  return "training";
}

function cleanTitle(title: string): string {
  return title.replace(/^✅\s*/, "").trim();
}

async function fetchJson<T>(url: string): Promise<T | null> {
  try {
    const res = await fetch(url, { next: { revalidate: 60 } });
    if (!res.ok) return null;
    return (await res.json()) as T;
  } catch (err) {
    console.error("Training Radar upstream fetch failed:", url, err);
    return null;
  }
}

function isConfirmedRegistration(status?: string | null): boolean {
  if (!status) return false;
  return ["registered", "confirmed", "entered", "paid"].includes(status.toLowerCase());
}

export async function GET(request: Request) {
  const now = new Date();
  const url = new URL(request.url);
  const lookbackDays = clampNumber(
    url.searchParams.get("lookbackDays"),
    DEFAULT_LOOKBACK_DAYS,
    1,
    60
  );
  const strengthAuditDays = clampNumber(
    url.searchParams.get("strengthAuditDays"),
    STRENGTH_AUDIT_DAYS,
    lookbackDays,
    90
  );
  const oldestCalendarStart = addDays(now, -Math.max(lookbackDays, strengthAuditDays));
  const generalStart = addDays(now, -lookbackDays);

  const calendarConfig = getCalendarConfig();
  let calendarConfigured = calendarConfig.configured;
  let calendarError: string | null = calendarConfig.configured ? null : calendarConfig.error || null;
  let calendarEvents: GoogleCalendarEvent[] = [];

  if (calendarConfig.configured) {
    try {
      const accessToken = await getAccessToken(calendarConfig.serviceAccount);
      calendarEvents = await fetchCalendarEvents({
        accessToken,
        calendarId: calendarConfig.calendarId,
        timeMin: oldestCalendarStart.toISOString(),
        timeMax: now.toISOString(),
      });
    } catch (err) {
      console.error("Training Radar calendar fetch error:", err);
      calendarError = "calendar_fetch_failed";
      calendarConfigured = true;
    }
  }

  const slippedSessions = calendarEvents
    .filter((event) => {
      const start = new Date(eventTime(event, "start"));
      const end = new Date(eventTime(event, "end") || eventTime(event, "start"));
      const type = sessionType(event);
      const inGeneralWindow = start >= generalStart;
      const inStrengthAudit = type === "strength" && start >= oldestCalendarStart;

      return (
        event.colorId === PLANNED_COLOR_ID &&
        end < now &&
        isTrainingEvent(event) &&
        (inGeneralWindow || inStrengthAudit)
      );
    })
    .map((event) => {
      const type = sessionType(event);
      const start = eventTime(event, "start");
      return {
        id: event.id,
        title: cleanTitle(event.summary || "Untitled session"),
        sessionType: type,
        start,
        daysOverdue: Math.max(0, Math.floor((now.getTime() - new Date(start).getTime()) / 86400000)),
        colorId: event.colorId || null,
        sourceUrl: event.htmlLink || null,
      };
    })
    .sort((a, b) => b.daysOverdue - a.daysOverdue)
    .slice(0, 6);

  const [raceJson, recoveryJson, activitiesJson, statsJson] = await Promise.all([
    fetchJson<{ data?: { races?: RaceApiRace[] } }>(`${API}/api/training/race-logistics`),
    fetchJson<{ data?: RecoveryData }>(`${API}/api/training/recovery`),
    fetchJson<{ data?: RunActivity[] }>(`${API}/api/gym/running/activities?days=7&limit=10`),
    fetchJson<{ data?: RunningStats }>(`${API}/api/gym/running/stats?days=7`),
  ]);

  const races = raceJson?.data?.races || [];
  const datedUpcoming = races
    .filter((race) => race.date)
    .map((race) => ({ ...race, computedDaysOut: dayDiff(race.date as string, now) }))
    .filter((race) => race.computedDaysOut >= 0)
    .sort((a, b) => a.computedDaysOut - b.computedDaysOut);

  const nextRace = datedUpcoming[0]
    ? {
        id: datedUpcoming[0].id,
        name: datedUpcoming[0].shortName || datedUpcoming[0].name,
        date: datedUpcoming[0].date,
        distance: datedUpcoming[0].distance || null,
        daysUntil: datedUpcoming[0].computedDaysOut,
        entryStatus: datedUpcoming[0].entryStatus || "unknown",
      }
    : null;

  const unconfirmedRaces = datedUpcoming
    .filter(
      (race) =>
        race.computedDaysOut <= RACE_RADAR_DAYS &&
        !isConfirmedRegistration(race.entryStatus)
    )
    .map((race) => ({
      id: race.id,
      name: race.shortName || race.name,
      date: race.date,
      distance: race.distance || null,
      daysUntil: race.computedDaysOut,
      entryStatus: race.entryStatus || "unknown",
      logisticsStatus: race.logisticsStatus || null,
    }))
    .slice(0, 6);

  const recovery = recoveryJson?.data || null;
  const stats = statsJson?.data || null;
  const activities = activitiesJson?.data || [];

  return NextResponse.json(
    {
      generatedAt: now.toISOString(),
      calendar: {
        configured: calendarConfigured,
        error: calendarError,
        lookbackDays,
        strengthAuditDays,
        plannedColorId: PLANNED_COLOR_ID,
        doneColorId: DONE_COLOR_ID,
        inspectedEvents: calendarEvents.length,
        slippedSessions,
      },
      raceRadar: {
        windowDays: RACE_RADAR_DAYS,
        nextRace,
        unconfirmedRaces,
      },
      recoveryCrossCheck: {
        recovery,
        strava: {
          activities,
          last7Days: stats?.last7Days || null,
        },
      },
    },
    { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=180" } }
  );
}
