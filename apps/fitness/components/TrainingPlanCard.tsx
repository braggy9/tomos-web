"use client";

import { useCoachToday } from "../hooks/useRunning";

const SESSION_TYPE_EMOJI: Record<string, string> = {
  easy: "\u{1F3C3}",
  long: "\u{1F3C3}\u200D\u2642\uFE0F",
  tempo: "\u26A1",
  intervals: "\u{1F525}",
  hills: "\u26F0\uFE0F",
  progressive: "\u{1F4C8}",
  bft: "\u{1F4AA}",
  metcon: "\u{1F3CB}\uFE0F",
  rest: "\u{1F634}",
  ocean: "\u{1F30A}",
  time_trial: "\u{1F3C1}",
  gym: "\u{1F3CB}\uFE0F",
  "cross-train": "\u{1F6B4}",
};

export function TrainingPlanCard() {
  const { data: coachToday, isLoading } = useCoachToday();

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  const prescription = coachToday?.prescription;

  if (!prescription) return null;

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
      {/* Header */}
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
          Coach Rx
        </span>
      </div>

      {/* Prescription content */}
      <div className="space-y-2">
        <div className="flex items-start gap-3">
          <span className="text-2xl">
            {SESSION_TYPE_EMOJI[prescription.sessionType] || "\u{1F4CB}"}
          </span>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm text-gray-900">
              {prescription.sessionType.charAt(0).toUpperCase() +
                prescription.sessionType.slice(1)}
              {prescription.targetDistanceKm && (
                <span className="text-gray-500 font-normal">
                  {" "}
                  — {prescription.targetDistanceKm}km
                </span>
              )}
            </p>
            <div className="flex items-center gap-2 mt-0.5">
              {prescription.targetHRZone && (
                <span className="text-xs font-medium text-violet-600">
                  {prescription.targetHRZone}
                </span>
              )}
              {prescription.targetPace && (
                <span className="text-xs text-gray-500">
                  {prescription.targetPace}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Structured workout */}
        {(prescription.warmup || prescription.mainSet || prescription.cooldown) && (
          <div className="bg-violet-50 rounded-lg px-3 py-2 space-y-1">
            {prescription.warmup && (
              <p className="text-xs text-gray-600">
                <span className="font-medium text-violet-700">Warmup:</span>{" "}
                {prescription.warmup}
              </p>
            )}
            {prescription.mainSet && (
              <p className="text-xs text-gray-600">
                <span className="font-medium text-violet-700">Main:</span>{" "}
                {prescription.mainSet}
              </p>
            )}
            {prescription.cooldown && (
              <p className="text-xs text-gray-600">
                <span className="font-medium text-violet-700">Cooldown:</span>{" "}
                {prescription.cooldown}
              </p>
            )}
          </div>
        )}

        {prescription.notes && (
          <p className="text-xs text-gray-500 italic">
            {prescription.notes}
          </p>
        )}
      </div>
    </div>
  );
}
