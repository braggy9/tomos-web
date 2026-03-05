"use client";

import Link from "next/link";
import { useTrainingToday } from "../hooks/useTraining";
import { useCoachToday } from "../hooks/useRunning";

const SESSION_TYPE_EMOJI: Record<string, string> = {
  easy: "🏃",
  long: "🏃‍♂️",
  tempo: "⚡",
  intervals: "🔥",
  hills: "⛰️",
  progressive: "📈",
  bft: "💪",
  metcon: "🏋️",
  rest: "😴",
  ocean: "🌊",
  time_trial: "🏁",
  gym: "🏋️",
  "cross-train": "🚴",
};

const PHASE_COLOR: Record<string, string> = {
  rebuild: "bg-blue-50 text-blue-700 border-blue-200",
  base: "bg-green-50 text-green-700 border-green-200",
  build: "bg-orange-50 text-orange-700 border-orange-200",
  specific: "bg-purple-50 text-purple-700 border-purple-200",
  taper: "bg-amber-50 text-amber-700 border-amber-200",
  race: "bg-red-50 text-red-700 border-red-200",
};

export function TrainingPlanCard() {
  const { data: plan, isLoading: planLoading } = useTrainingToday();
  const { data: coachToday, isLoading: coachLoading } = useCoachToday();

  const isLoading = planLoading || coachLoading;

  if (isLoading) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-4 animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-3" />
        <div className="h-3 bg-gray-100 rounded w-2/3" />
      </div>
    );
  }

  const prescription = coachToday?.prescription;
  const plannedSession = coachToday?.plannedSession || plan?.todaysSessions?.[0];
  const hasPlan = plan?.hasActivePlan;

  // Nothing to show
  if (!prescription && !hasPlan) return null;

  const phaseStyle =
    PHASE_COLOR[plan?.block?.phase || ""] ||
    "bg-gray-50 text-gray-700 border-gray-200";

  return (
    <Link href="/plan" className="block">
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3 hover:border-brand-300 transition-colors">
        {/* Header row */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {hasPlan && (
              <>
                <span
                  className={`text-xs font-medium px-2 py-0.5 rounded-full border ${phaseStyle}`}
                >
                  {plan?.block?.phase}
                </span>
                <span className="text-sm font-semibold text-gray-900">
                  {plan?.block?.name}
                </span>
              </>
            )}
            {prescription && (
              <span className="text-xs font-medium px-2 py-0.5 rounded-full border bg-violet-50 text-violet-700 border-violet-200">
                Coach Rx
              </span>
            )}
          </div>
          {hasPlan && (
            <span className="text-xs text-gray-400">
              Week {plan?.week?.weekNumber}
            </span>
          )}
        </div>

        {/* Coach prescription (primary when present) */}
        {prescription ? (
          <div className="space-y-2">
            <div className="flex items-start gap-3">
              <span className="text-2xl">
                {SESSION_TYPE_EMOJI[prescription.sessionType] || "📋"}
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

            {/* Planned session as greyed-out secondary context */}
            {plannedSession && (
              <div className="border-t border-gray-100 pt-2 mt-2">
                <p className="text-xs text-gray-400">
                  Plan:{" "}
                  {SESSION_TYPE_EMOJI[plannedSession.sessionType] || "📋"}{" "}
                  {"sessionName" in plannedSession
                    ? plannedSession.sessionName || plannedSession.sessionType
                    : plannedSession.sessionType}
                  {plannedSession.targetDistanceKm &&
                    ` (${plannedSession.targetDistanceKm}km)`}
                </p>
              </div>
            )}
          </div>
        ) : plannedSession ? (
          /* No prescription — show planned session as primary (original behavior) */
          <div className="flex items-start gap-3">
            <span className="text-2xl">
              {SESSION_TYPE_EMOJI[plannedSession.sessionType] || "📋"}
            </span>
            <div className="flex-1 min-w-0">
              <p className="font-medium text-sm text-gray-900">
                {"sessionName" in plannedSession
                  ? plannedSession.sessionName || plannedSession.sessionType
                  : plannedSession.sessionType}
                {"isOptional" in plannedSession && plannedSession.isOptional && (
                  <span className="text-xs text-gray-400 ml-1">(optional)</span>
                )}
              </p>
              <div className="flex items-center gap-2 mt-0.5">
                {plannedSession.targetDistanceKm && (
                  <span className="text-xs text-gray-500">
                    {plannedSession.targetDistanceKm}km
                  </span>
                )}
                {"targetPaceZone" in plannedSession &&
                  plannedSession.targetPaceZone && (
                    <span className="text-xs text-gray-400">
                      @ {plannedSession.targetPaceZone}
                    </span>
                  )}
              </div>
              {plannedSession.notes && (
                <p className="text-xs text-gray-400 mt-1 line-clamp-1">
                  {plannedSession.notes}
                </p>
              )}
            </div>
          </div>
        ) : (
          <p className="text-sm text-gray-500">
            No specific session planned for today
          </p>
        )}

        {/* Progress bar */}
        {plan?.weekProgress && (
          <div>
            <div className="flex items-center justify-between text-xs text-gray-400 mb-1">
              <span>
                {plan.weekProgress.completed}/{plan.weekProgress.planned}{" "}
                sessions
              </span>
              {plan.weekProgress.targetKm && (
                <span>
                  {plan.weekProgress.actualKm ?? 0}/{plan.weekProgress.targetKm}
                  km
                </span>
              )}
            </div>
            <div className="bg-gray-100 rounded-full h-1.5">
              <div
                className="bg-brand-500 rounded-full h-1.5 transition-all"
                style={{
                  width: `${
                    plan.weekProgress.planned > 0
                      ? Math.min(
                          100,
                          (plan.weekProgress.completed /
                            plan.weekProgress.planned) *
                            100
                        )
                      : 0
                  }%`,
                }}
              />
            </div>
          </div>
        )}

        {/* Key focus */}
        {plan?.week?.keyFocus && (
          <p className="text-xs text-gray-400 italic">
            {plan.week.keyFocus}
          </p>
        )}
      </div>
    </Link>
  );
}
