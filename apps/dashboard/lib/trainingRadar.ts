import {
  fetchCalendarEvents,
  getAccessToken,
  getCalendarConfig,
  type GoogleCalendarEvent,
} from "./googleCalendar";
import {
  classifySessionTypes,
  isConfirmedRegistration,
  reconcileRunSessions,
  sydneyDayDiff,
  type SessionType,
} from "./trainingRadarLogic";

const API = "https://tomos-task-api.vercel.app";
const PLANNED_COLOR_ID = "10";
const DONE_COLOR_ID = "8";
const DEFAULT_LOOKBACK_DAYS = 14;
const STRENGTH_AUDIT_DAYS = 30;
const RACE_RADAR_DAYS = 60;
const MAX_VISIBLE_ITEMS = 6;

interface RaceApiRace {
  id: string;
  name: string;
  shortName?: string;
  date: string | null;
  distance?: string;
  entryStatus?: string | null;
  logisticsStatus?: string | null;
}

export interface RecoveryData {
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

export interface RunActivity {
  id: string;
  date: string;
  type: string;
  distance: number;
  duration: number;
  avgPace: number | null;
  activityName: string | null;
}

export interface StravaSyncHealth {
  provider: string;
  lastAttemptAt: string | null;
  lastSuccessAt: string | null;
  latestActivityAt: string | null;
  lastError: string | null;
  staleAfterHours: number;
  stale: boolean;
}

export type RadarSourceStatus = "healthy" | "unavailable";

export interface RadarSourceHealth {
  status: RadarSourceStatus;
  error: string | null;
}

export interface TrainingRadar {
  generatedAt: string;
  degraded: boolean;
  sourceHealth: {
    calendar: RadarSourceHealth;
    races: RadarSourceHealth;
    recovery: RadarSourceHealth;
    activities: RadarSourceHealth;
    runningStats: RadarSourceHealth;
    stravaSync: RadarSourceHealth;
  };
  calendar: {
    configured: boolean;
    error: string | null;
    lookbackDays: number;
    strengthAuditDays: number;
    plannedColorId: string;
    doneColorId: string;
    inspectedEvents: number;
    reconciledRunSessions: number;
    totalSlippedSessions: number;
    totalNeedsClassification: number;
    slippedSessions: RadarCalendarItem[];
    needsClassification: RadarCalendarItem[];
  };
  raceRadar: {
    windowDays: number;
    nextRace: {
      id: string;
      name: string;
      date: string;
      distance: string | null;
      daysUntil: number;
      entryStatus: string;
    } | null;
    totalUnconfirmedRaces: number;
    unconfirmedRaces: {
      id: string;
      name: string;
      date: string;
      distance: string | null;
      daysUntil: number;
      entryStatus: string;
      logisticsStatus: string | null;
    }[];
  };
  recoveryCrossCheck: {
    recovery: RecoveryData | null;
    recoveryAgeDays: number | null;
    recoveryStale: boolean;
    strava: {
      activities: RunActivity[];
      last7Days: RunningStats["last7Days"] | null;
      syncHealth: StravaSyncHealth | null;
    };
  };
}

export interface RadarCalendarItem {
  id: string;
  title: string;
  sessionType: string;
  sessionTypes: SessionType[];
  start: string;
  daysOverdue: number;
  colorId: string | null;
  sourceUrl: string | null;
  possibleActivityMatch: boolean;
}

export interface TrainingRadarOptions {
  lookbackDays?: number;
  strengthAuditDays?: number;
}

interface SourceResult<T> {
  data: T | null;
  health: RadarSourceHealth;
}

function clampNumber(value: number | undefined, fallback: number, min: number, max: number): number {
  if (value === undefined || !Number.isFinite(value)) return fallback;
  return Math.min(Math.max(Math.round(value), min), max);
}

export function parseTrainingRadarOptions(url: URL): TrainingRadarOptions {
  const lookbackValue = url.searchParams.get("lookbackDays");
  const strengthAuditValue = url.searchParams.get("strengthAuditDays");
  const lookback = lookbackValue === null ? Number.NaN : Number(lookbackValue);
  const strengthAudit = strengthAuditValue === null ? Number.NaN : Number(strengthAuditValue);

  return {
    lookbackDays: Number.isFinite(lookback) ? lookback : undefined,
    strengthAuditDays: Number.isFinite(strengthAudit) ? strengthAudit : undefined,
  };
}

function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

function eventTime(event: GoogleCalendarEvent, edge: "start" | "end"): string {
  const value = edge === "start" ? event.start : event.end;
  return value?.dateTime || value?.date || "";
}

function cleanTitle(title: string): string {
  return title.replace(/^✅\s*/, "").trim();
}

function isManagedTrainingEvent(event: GoogleCalendarEvent): boolean {
  const text = `${event.summary || ""} ${event.description || ""}`.toLowerCase();
  return text.includes("greta wk") || text.includes("car park strength");
}

function unavailable(error: string): RadarSourceHealth {
  return { status: "unavailable", error };
}

function healthy(): RadarSourceHealth {
  return { status: "healthy", error: null };
}

async function fetchSource<T>(url: string): Promise<SourceResult<T>> {
  const token = process.env.TOMOS_TRAINING_READ_TOKEN?.trim();
  if (!token) return { data: null, health: unavailable("training_api_auth_not_configured") };

  try {
    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    if (!response.ok) {
      console.error("Training Radar upstream returned", response.status, url);
      return { data: null, health: unavailable(`upstream_http_${response.status}`) };
    }
    return { data: (await response.json()) as T, health: healthy() };
  } catch (error) {
    console.error("Training Radar upstream fetch failed:", url, error);
    return { data: null, health: unavailable("upstream_fetch_failed") };
  }
}

function calendarItem(event: GoogleCalendarEvent, now: Date): RadarCalendarItem {
  const start = eventTime(event, "start");
  const types = classifySessionTypes(event);
  const difference = sydneyDayDiff(start, now);
  return {
    id: event.id,
    title: cleanTitle(event.summary || "Untitled session"),
    sessionType: types.join(" + ") || "training",
    sessionTypes: types,
    start,
    daysOverdue: Math.max(0, -(difference ?? 0)),
    colorId: event.colorId || null,
    sourceUrl: event.htmlLink || null,
    possibleActivityMatch: false,
  };
}

export function hasRadarAttention(data: TrainingRadar): boolean {
  return (
    data.degraded ||
    data.calendar.totalSlippedSessions > 0 ||
    data.calendar.totalNeedsClassification > 0 ||
    data.raceRadar.totalUnconfirmedRaces > 0 ||
    data.recoveryCrossCheck.recoveryStale ||
    !data.recoveryCrossCheck.strava.syncHealth ||
    data.recoveryCrossCheck.strava.syncHealth.stale
  );
}

export async function getTrainingRadarData(options: TrainingRadarOptions = {}): Promise<TrainingRadar> {
  const now = new Date();
  const lookbackDays = clampNumber(options.lookbackDays, DEFAULT_LOOKBACK_DAYS, 1, 60);
  const strengthAuditDays = clampNumber(options.strengthAuditDays, STRENGTH_AUDIT_DAYS, lookbackDays, 90);
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
    } catch (error) {
      console.error("Training Radar calendar fetch error:", error);
      calendarError = "calendar_fetch_failed";
      calendarConfigured = true;
    }
  }

  const passedTrainingEvents = calendarEvents.filter((event) => {
    const start = new Date(eventTime(event, "start"));
    const end = new Date(eventTime(event, "end") || eventTime(event, "start"));
    const types = classifySessionTypes(event);
    const inGeneralWindow = start >= generalStart;
    const inStrengthAudit = types.includes("strength") && start >= oldestCalendarStart;
    return end < now && types.length > 0 && (inGeneralWindow || inStrengthAudit);
  });

  const slippedCandidates = passedTrainingEvents
    .filter((event) => event.colorId === PLANNED_COLOR_ID)
    .map((event) => calendarItem(event, now))
    .sort((left, right) => right.daysOverdue - left.daysOverdue);

  const classificationCandidates = passedTrainingEvents
    .filter(
      (event) =>
        event.colorId !== PLANNED_COLOR_ID &&
        event.colorId !== DONE_COLOR_ID &&
        isManagedTrainingEvent(event)
    )
    .map((event) => calendarItem(event, now))
    .sort((left, right) => right.daysOverdue - left.daysOverdue);

  const [raceResult, recoveryResult, activitiesResult, statsResult, stravaStatusResult] = await Promise.all([
    fetchSource<{ data?: { races?: RaceApiRace[] } }>(`${API}/api/training/race-logistics`),
    fetchSource<{ data?: RecoveryData }>(`${API}/api/training/recovery`),
    fetchSource<{ data?: RunActivity[] }>(`${API}/api/gym/running/activities?days=${lookbackDays}&limit=50`),
    fetchSource<{ data?: RunningStats }>(`${API}/api/gym/running/stats?days=7`),
    fetchSource<{ data?: StravaSyncHealth }>(`${API}/api/gym/sync/strava/status`),
  ]);

  const races = raceResult.data?.data?.races || [];
  const datedUpcoming = races
    .filter((race) => race.date)
    .map((race) => ({ ...race, computedDaysOut: sydneyDayDiff(race.date as string, now) }))
    .filter((race) => race.computedDaysOut !== null && race.computedDaysOut >= 0)
    .sort((left, right) => (left.computedDaysOut as number) - (right.computedDaysOut as number));

  const nextRace = datedUpcoming[0]
    ? {
        id: datedUpcoming[0].id,
        name: datedUpcoming[0].shortName || datedUpcoming[0].name,
        date: datedUpcoming[0].date as string,
        distance: datedUpcoming[0].distance || null,
        daysUntil: datedUpcoming[0].computedDaysOut as number,
        entryStatus: datedUpcoming[0].entryStatus || "unknown",
      }
    : null;

  const allUnconfirmedRaces = datedUpcoming
    .filter((race) => (race.computedDaysOut as number) <= RACE_RADAR_DAYS && !isConfirmedRegistration(race.entryStatus))
    .map((race) => ({
      id: race.id,
      name: race.shortName || race.name,
      date: race.date as string,
      distance: race.distance || null,
      daysUntil: race.computedDaysOut as number,
      entryStatus: race.entryStatus || "unknown",
      logisticsStatus: race.logisticsStatus || null,
    }));

  const recovery = recoveryResult.data?.data || null;
  const stats = statsResult.data?.data || null;
  const activities = activitiesResult.data?.data || [];
  const reconciliation = reconcileRunSessions(slippedCandidates, activities);
  const allSlippedSessions = slippedCandidates
    .filter((session) => !reconciliation.matchedIds.has(session.id))
    .map((session) => ({
      ...session,
      possibleActivityMatch: reconciliation.possibleMatchIds.has(session.id),
    }));
  const recoveryDifference = recovery ? sydneyDayDiff(recovery.date, now) : null;
  const recoveryAgeDays = recoveryDifference === null ? null : Math.max(0, -recoveryDifference);

  const sourceHealth = {
    calendar: calendarError ? unavailable(calendarError) : healthy(),
    races: raceResult.health,
    recovery: recoveryResult.health,
    activities: activitiesResult.health,
    runningStats: statsResult.health,
    stravaSync: stravaStatusResult.health,
  };

  return {
    generatedAt: now.toISOString(),
    degraded: Object.values(sourceHealth).some((source) => source.status !== "healthy"),
    sourceHealth,
    calendar: {
      configured: calendarConfigured,
      error: calendarError,
      lookbackDays,
      strengthAuditDays,
      plannedColorId: PLANNED_COLOR_ID,
      doneColorId: DONE_COLOR_ID,
      inspectedEvents: calendarEvents.length,
      reconciledRunSessions: reconciliation.matchedIds.size,
      totalSlippedSessions: allSlippedSessions.length,
      totalNeedsClassification: classificationCandidates.length,
      slippedSessions: allSlippedSessions.slice(0, MAX_VISIBLE_ITEMS),
      needsClassification: classificationCandidates.slice(0, MAX_VISIBLE_ITEMS),
    },
    raceRadar: {
      windowDays: RACE_RADAR_DAYS,
      nextRace,
      totalUnconfirmedRaces: allUnconfirmedRaces.length,
      unconfirmedRaces: allUnconfirmedRaces.slice(0, MAX_VISIBLE_ITEMS),
    },
    recoveryCrossCheck: {
      recovery,
      recoveryAgeDays,
      recoveryStale: recoveryAgeDays === null || recoveryAgeDays > 3,
      strava: {
        activities,
        last7Days: stats?.last7Days || null,
        syncHealth: stravaStatusResult.data?.data || null,
      },
    },
  };
}
