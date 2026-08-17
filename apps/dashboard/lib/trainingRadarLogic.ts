export type SessionType = "strength" | "recovery" | "tempo" | "intervals" | "long run" | "hills" | "run";

export interface TrainingText {
  summary?: string;
  description?: string;
}

export interface ReconciliationCandidate {
  id: string;
  title: string;
  start: string;
  sessionTypes: SessionType[];
}

export interface ReconciliationActivity {
  id: string;
  date: string;
  type: string;
  distance: number;
  activityName?: string | null;
}

const RUN_TYPES = new Set<SessionType>(["run", "tempo", "intervals", "long run", "hills"]);

function classificationText(value: TrainingText): string {
  return (value.summary?.trim() || value.description || "").toLowerCase();
}

export function classifySessionTypes(value: TrainingText): SessionType[] {
  const text = classificationText(value);
  const types: SessionType[] = [];

  if (["strength", "car park", "gym", "weights", "🏋", "💪"].some((marker) => text.includes(marker))) {
    types.push("strength");
  }
  if (["pilates", "pliability", "mobility", "yoga", "🧘"].some((marker) => text.includes(marker))) {
    types.push("recovery");
  }
  if (text.includes("tempo")) types.push("tempo");
  else if (text.includes("interval")) types.push("intervals");
  else if (text.includes("long run")) types.push("long run");
  else if (text.includes("hills")) types.push("hills");
  else if (/\brun(?:ning)?\b/.test(text) || text.includes("easy") || text.includes("🏃")) types.push("run");

  return types;
}

export function isRunSessionType(type: SessionType): boolean {
  return RUN_TYPES.has(type);
}

export function sydneyDateKey(value: string | Date): string | null {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return null;

  const parts = new Intl.DateTimeFormat("en-AU", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);
  const values = Object.fromEntries(parts.map((part) => [part.type, part.value]));
  return `${values.year}-${values.month}-${values.day}`;
}

function utcDayNumber(dateKey: string): number {
  const [year, month, day] = dateKey.split("-").map(Number);
  return Date.UTC(year, month - 1, day) / 86400000;
}

export function sydneyDayDiff(target: string, now: Date = new Date()): number | null {
  const targetKey = sydneyDateKey(target);
  const nowKey = sydneyDateKey(now);
  if (!targetKey || !nowKey) return null;
  return utcDayNumber(targetKey) - utcDayNumber(nowKey);
}

interface DistanceRange {
  min: number;
  max: number;
}

export function plannedDistanceRange(title: string): DistanceRange | null {
  const normalized = title.replace(/[–—]/g, "-");
  const range = normalized.match(/(\d+(?:\.\d+)?)\s*-\s*(\d+(?:\.\d+)?)\s*km\b/i);
  if (range) return { min: Number(range[1]), max: Number(range[2]) };

  const single = normalized.match(/(\d+(?:\.\d+)?)\s*km\b/i);
  if (!single) return null;
  const distance = Number(single[1]);
  return { min: distance, max: distance };
}

function activityRunType(activity: ReconciliationActivity): SessionType {
  const text = `${activity.type} ${activity.activityName || ""}`.toLowerCase();
  if (text.includes("tempo")) return "tempo";
  if (text.includes("interval")) return "intervals";
  if (text.includes("long")) return "long run";
  if (text.includes("hill")) return "hills";
  return "run";
}

function distanceMatches(range: DistanceRange | null, actual: number): boolean {
  if (!range) return true;
  const lowerTolerance = Math.max(0.5, range.min * 0.15);
  const upperTolerance = Math.max(0.5, range.max * 0.15);
  return actual >= range.min - lowerTolerance && actual <= range.max + upperTolerance;
}

function isConfidentMatch(candidate: ReconciliationCandidate, activity: ReconciliationActivity): boolean {
  if (candidate.sessionTypes.length === 0 || candidate.sessionTypes.some((type) => !isRunSessionType(type))) {
    return false;
  }

  const expectedType = candidate.sessionTypes[0];
  const actualType = activityRunType(activity);
  if (expectedType !== "run" && expectedType !== actualType) return false;

  return distanceMatches(plannedDistanceRange(candidate.title), activity.distance);
}

export function reconcileRunSessions(
  candidates: ReconciliationCandidate[],
  activities: ReconciliationActivity[]
): { matchedIds: Set<string>; possibleMatchIds: Set<string> } {
  const matchedIds = new Set<string>();
  const possibleMatchIds = new Set<string>();
  const usedActivities = new Set<string>();

  for (const candidate of candidates) {
    if (candidate.sessionTypes.length === 0 || candidate.sessionTypes.some((type) => !isRunSessionType(type))) {
      continue;
    }

    const candidateDate = sydneyDateKey(candidate.start);
    const sameDay = activities.filter(
      (activity) => !usedActivities.has(activity.id) && sydneyDateKey(activity.date) === candidateDate
    );
    const match = sameDay.find((activity) => isConfidentMatch(candidate, activity));

    if (match) {
      matchedIds.add(candidate.id);
      usedActivities.add(match.id);
    } else if (sameDay.length > 0) {
      possibleMatchIds.add(candidate.id);
    }
  }

  return { matchedIds, possibleMatchIds };
}

export function isConfirmedRegistration(status?: string | null): boolean {
  if (!status) return false;
  return ["registered", "confirmed", "entered", "paid"].includes(status.trim().toLowerCase());
}
