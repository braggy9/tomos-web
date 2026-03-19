"use client";

import type { RaceCard, ChecklistItem } from "@tomos/api";

interface Props {
  race: RaceCard;
  onClose: () => void;
}

const STATUS_BADGE: Record<string, { label: string; className: string }> = {
  registered: { label: "Registered", className: "bg-green-100 text-green-700" },
  chasing: { label: "Chasing Entry", className: "bg-amber-100 text-amber-700" },
  waitlisted: { label: "Waitlisted", className: "bg-yellow-100 text-yellow-700" },
  tbc: { label: "TBC", className: "bg-gray-100 text-gray-600" },
  dropped: { label: "Dropped", className: "bg-red-100 text-red-600" },
};

const LOGISTICS_BADGE: Record<string, { label: string; className: string }> = {
  sorted: { label: "All Sorted", className: "bg-green-100 text-green-700" },
  outstanding: { label: "Outstanding", className: "bg-amber-100 text-amber-700" },
  urgent: { label: "Urgent", className: "bg-red-100 text-red-700" },
};

export function RaceDetailCard({ race, onClose }: Props) {
  const entryBadge = STATUS_BADGE[race.entryStatus] || STATUS_BADGE.tbc;
  const logBadge = LOGISTICS_BADGE[race.logisticsStatus] || LOGISTICS_BADGE.outstanding;

  const checklistSections = [
    { label: "Entry", items: race.checklists.entry },
    { label: "Kids Week Logistics", items: race.checklists.kidsWeekLogistics },
    { label: "Support Crew", items: race.checklists.supportCrew },
    { label: "Accommodation", items: race.checklists.accommodation },
    { label: "Travel", items: race.checklists.travel },
    { label: "Gear & Nutrition", items: race.checklists.gearNutrition },
    { label: "Race Week", items: race.checklists.raceWeek },
  ].filter((s) => s.items !== null && s.items.length > 0) as {
    label: string;
    items: ChecklistItem[];
  }[];

  return (
    <div className="space-y-4">
      {/* Back button */}
      <button
        onClick={onClose}
        className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Back to calendar
      </button>

      {/* Header card */}
      <div className={`rounded-xl border-2 p-4 space-y-3 ${
        race.type === "trail" ? "border-teal-200 bg-teal-50/30" : "border-blue-200 bg-blue-50/30"
      }`}>
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">
              {race.isARace && <span className="mr-1">🏆</span>}
              {race.name}
            </h2>
            <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
              <span>{race.dateDisplay}</span>
              <span className="text-gray-300">·</span>
              <span>{race.distance}</span>
              <span className="text-gray-300">·</span>
              <span className="capitalize">{race.type}</span>
            </div>
            <p className="text-xs text-gray-500 mt-0.5">{race.location}</p>
          </div>
          {race.daysOut !== null && race.daysOut > 0 && (
            <div className="text-right shrink-0">
              <span className="text-2xl font-bold text-gray-900">{race.daysOut}</span>
              <p className="text-[10px] text-gray-400">days out</p>
            </div>
          )}
        </div>

        {/* Status row */}
        <div className="flex flex-wrap gap-2">
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${entryBadge.className}`}>
            {entryBadge.label}
          </span>
          <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${logBadge.className}`}>
            {logBadge.label}
          </span>
          {race.kidsWeek !== null && (
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
              race.kidsWeek ? "bg-amber-100 text-amber-700" : "bg-green-100 text-green-700"
            }`}>
              {race.kidsWeek ? "🧒 Kids Week" : "Solo Week"}
            </span>
          )}
          {race.needsMiloCare && (
            <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full ${
              race.miloCareSorted ? "bg-green-100 text-green-700" : "bg-pink-100 text-pink-700"
            }`}>
              🐾 Milo {race.miloCareSorted ? "Sorted" : "TBD"}
            </span>
          )}
        </div>

        {/* Target / Notes */}
        {race.target && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Target:</span> {race.target}
          </p>
        )}
        {race.raceShoes && (
          <p className="text-sm text-gray-600">
            <span className="font-medium">Shoes:</span> {race.raceShoes}
          </p>
        )}
      </div>

      {/* Checklists */}
      {checklistSections.length > 0 && (
        <div className="space-y-3">
          {checklistSections.map((section) => {
            const done = section.items.filter((i) => i.checked).length;
            const total = section.items.length;
            return (
              <div key={section.label} className="bg-white rounded-xl border border-gray-200 p-3">
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-semibold text-gray-700">{section.label}</h3>
                  <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${
                    done === total
                      ? "bg-green-100 text-green-700"
                      : "bg-gray-100 text-gray-500"
                  }`}>
                    {done}/{total}
                  </span>
                </div>
                <div className="space-y-1">
                  {section.items.map((item, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <div className={`w-4 h-4 rounded border mt-0.5 shrink-0 flex items-center justify-center ${
                        item.checked
                          ? "bg-green-500 border-green-500"
                          : "border-gray-300"
                      }`}>
                        {item.checked && (
                          <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </div>
                      <span className={`text-xs ${item.checked ? "text-gray-400 line-through" : "text-gray-700"}`}>
                        {item.text}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Cost summary */}
      {race.costs.total > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-2">Costs</h3>
          <div className="space-y-1 text-xs">
            {race.costs.entryFee.amount !== null && (
              <div className="flex justify-between">
                <span className="text-gray-500">Entry</span>
                <span className={race.costs.entryFee.paid ? "text-green-600" : "text-amber-600"}>
                  ${race.costs.entryFee.amount.toFixed(2)}
                  {race.costs.entryFee.paid ? " ✓" : " est."}
                </span>
              </div>
            )}
            {(race.costs.accommodation.booked || race.costs.accommodation.estimated) && (
              <div className="flex justify-between">
                <span className="text-gray-500">Accommodation</span>
                <span className={race.costs.accommodation.booked ? "text-green-600" : "text-amber-600"}>
                  ${(race.costs.accommodation.booked || race.costs.accommodation.estimated || 0).toFixed(2)}
                  {race.costs.accommodation.booked ? " ✓" : " est."}
                </span>
              </div>
            )}
            {(race.costs.travel.booked || race.costs.travel.estimated) && (
              <div className="flex justify-between">
                <span className="text-gray-500">Travel</span>
                <span className={race.costs.travel.booked ? "text-green-600" : "text-amber-600"}>
                  ${(race.costs.travel.booked || race.costs.travel.estimated || 0).toFixed(2)}
                  {race.costs.travel.booked ? " ✓" : " est."}
                </span>
              </div>
            )}
            <div className="flex justify-between pt-1 border-t border-gray-100 font-medium">
              <span className="text-gray-700">Total</span>
              <span className="text-gray-900">${race.costs.total.toFixed(2)}</span>
            </div>
          </div>
          {race.costs.entryFee.note && (
            <p className="text-[10px] text-gray-400 mt-1">{race.costs.entryFee.note}</p>
          )}
        </div>
      )}

      {/* Notes */}
      {race.notes && (
        <div className="bg-white rounded-xl border border-gray-200 p-3">
          <h3 className="text-sm font-semibold text-gray-700 mb-1">Notes</h3>
          <p className="text-xs text-gray-600">{race.notes}</p>
        </div>
      )}
    </div>
  );
}
