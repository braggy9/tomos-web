"use client";

import { useMemo } from "react";
import type { RaceCard, CustodyWeek } from "@tomos/api";

interface Props {
  races: RaceCard[];
  schedule: CustodyWeek[];
  onSelectRace: (raceId: string) => void;
}

function getTodayStr(): string {
  const now = new Date();
  const sydney = new Date(now.toLocaleString("en-US", { timeZone: "Australia/Sydney" }));
  return `${sydney.getFullYear()}-${String(sydney.getMonth() + 1).padStart(2, "0")}-${String(sydney.getDate()).padStart(2, "0")}`;
}

function formatWeekRange(start: string, end: string): string {
  const s = new Date(start + "T12:00:00");
  const e = new Date(end + "T12:00:00");
  return `${s.toLocaleDateString("en-AU", { day: "numeric", month: "short" })} – ${e.toLocaleDateString("en-AU", { day: "numeric", month: "short" })}`;
}

function getMonthLabel(dateStr: string): string {
  const d = new Date(dateStr + "T12:00:00");
  return d.toLocaleDateString("en-AU", { month: "long", year: "numeric" });
}

const STATUS_DOT: Record<string, string> = {
  sorted: "bg-green-500",
  outstanding: "bg-amber-500",
  urgent: "bg-red-500",
};

export function RaceCalendarOverlay({ races, schedule, onSelectRace }: Props) {
  const today = useMemo(getTodayStr, []);

  // Group weeks by month
  const months = useMemo(() => {
    const map = new Map<string, CustodyWeek[]>();
    for (const week of schedule) {
      const key = week.startDate.slice(0, 7);
      if (!map.has(key)) map.set(key, []);
      map.get(key)!.push(week);
    }
    return map;
  }, [schedule]);

  // Find races in a given week
  function racesInWeek(week: CustodyWeek): RaceCard[] {
    return races.filter((r) => {
      if (!r.date) return false;
      return r.date >= week.startDate && r.date < week.endDate;
    });
  }

  // Check if today falls in a week
  function isCurrentWeek(week: CustodyWeek): boolean {
    return today >= week.startDate && today < week.endDate;
  }

  // Filter to relevant months (current month onwards, or months with races)
  const currentMonth = today.slice(0, 7);
  const raceMonths = new Set(
    races.filter((r) => r.date).map((r) => r.date!.slice(0, 7))
  );

  return (
    <div className="space-y-4">
      {Array.from(months.entries())
        .filter(([month]) => month >= currentMonth || raceMonths.has(month))
        .map(([month, weeks]) => (
          <div key={month}>
            {/* Month header */}
            <h3 className="text-sm font-bold text-gray-700 mb-2 sticky top-0 bg-gray-50 py-1 z-10">
              {getMonthLabel(weeks[0].startDate)}
            </h3>

            {/* Week rows */}
            <div className="space-y-1.5">
              {weeks.map((week) => {
                const weekRaces = racesInWeek(week);
                const isCurrent = isCurrentWeek(week);
                const isKids = week.status === "kids";

                return (
                  <div
                    key={week.startDate}
                    className={`rounded-lg px-3 py-2 transition-all ${
                      isCurrent
                        ? "border-l-4 border-l-red-500 bg-white shadow-sm"
                        : "border-l-4 border-l-transparent"
                    } ${
                      isKids ? "bg-amber-50/50" : "bg-green-50/30"
                    }`}
                  >
                    <div className="flex items-center gap-2 flex-wrap">
                      {/* Date range */}
                      <span className="text-[11px] text-gray-500 w-[110px] shrink-0">
                        {formatWeekRange(week.startDate, week.endDate)}
                      </span>

                      {/* Custody badge */}
                      <span
                        className={`text-[10px] font-medium px-2 py-0.5 rounded-full shrink-0 ${
                          isKids
                            ? "bg-amber-100 text-amber-700"
                            : "bg-green-100 text-green-700"
                        }`}
                      >
                        {isKids ? "Kids" : "Solo"}
                      </span>

                      {/* Race chips */}
                      {weekRaces.map((race) => (
                        <button
                          key={race.id}
                          onClick={() => onSelectRace(race.id)}
                          className={`inline-flex items-center gap-1.5 text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all hover:shadow-md active:scale-95 ${
                            getRaceChipStyle(race)
                          }`}
                        >
                          {/* Status dot */}
                          <span
                            className={`w-1.5 h-1.5 rounded-full shrink-0 ${STATUS_DOT[race.logisticsStatus]}`}
                          />
                          {race.isARace && <span className="text-[9px]">🏆</span>}
                          {race.shortName}
                          <span className="text-[9px] opacity-70">{race.distance}</span>
                        </button>
                      ))}

                      {/* Logistics flags for unresolved items */}
                      {weekRaces.map((race) => (
                        <LogisticsFlags key={`flags-${race.id}`} race={race} />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}

      {/* Races without dates (TBC) */}
      {races.filter((r) => !r.date && r.entryStatus !== "dropped").length > 0 && (
        <div>
          <h3 className="text-sm font-bold text-gray-700 mb-2">Date TBC</h3>
          <div className="space-y-1.5">
            {races
              .filter((r) => !r.date && r.entryStatus !== "dropped")
              .map((race) => (
                <button
                  key={race.id}
                  onClick={() => onSelectRace(race.id)}
                  className="w-full text-left rounded-lg px-3 py-2 bg-gray-50 hover:bg-gray-100 transition-colors"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${STATUS_DOT[race.logisticsStatus]}`} />
                    <span className="text-sm font-medium text-gray-700">{race.name}</span>
                    <span className="text-xs text-gray-400">{race.distance}</span>
                    <span className="text-[10px] text-gray-400 ml-auto">{race.dateDisplay}</span>
                  </div>
                </button>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}

function getRaceChipStyle(race: RaceCard): string {
  const base = race.type === "trail"
    ? "bg-teal-50 text-teal-800 border border-teal-200"
    : "bg-blue-50 text-blue-800 border border-blue-200";

  const aRace = race.isARace ? " border-2" : "";

  if (race.entryStatus === "dropped") return `${base}${aRace} opacity-40 line-through`;
  if (race.entryStatus === "chasing" || race.entryStatus === "tbc") return `${base}${aRace} border-dashed opacity-75`;
  if (race.entryStatus === "waitlisted") return `${base}${aRace} border-dotted opacity-80`;

  return `${base}${aRace}`;
}

function LogisticsFlags({ race }: { race: RaceCard }) {
  const flags: { label: string; className: string }[] = [];

  if (race.needsChildcare && !race.childcareSorted) {
    flags.push({ label: "childcare", className: "bg-red-100 text-red-700" });
  }
  if (race.needsAccommodation && !race.accommodationSorted) {
    flags.push({ label: "accom", className: "bg-purple-100 text-purple-700" });
  }
  if (race.needsTravel && !race.travelSorted) {
    flags.push({ label: "travel", className: "bg-purple-100 text-purple-700" });
  }
  if (race.needsMiloCare && !race.miloCareSorted) {
    flags.push({ label: "Milo 🐾", className: "bg-pink-100 text-pink-700" });
  }

  if (flags.length === 0) return null;

  return (
    <>
      {flags.map((f) => (
        <span
          key={f.label}
          className={`text-[9px] font-medium px-1.5 py-0.5 rounded ${f.className}`}
        >
          {f.label}
        </span>
      ))}
    </>
  );
}
