"use client";

import { useState, useCallback } from "react";
import { useSuggestion, useQuickLog } from "../hooks/useFitness";
import { useRecoveryCheckins } from "../hooks/useRecovery";
import { Spinner, useToast } from "@tomos/ui";
import type { WeekType, ExerciseSuggestion } from "@tomos/api";

interface SetState {
  done: boolean;
  weight: number;
  reps: number;
  rpe: number;
}

interface ExerciseState {
  name: string;
  exerciseId: string;
  suggestedWeight: number;
  sets: SetState[];
}

const SESSION_NAMES: Record<string, string> = {
  A: "Strength + Power",
  B: "Upper + Core",
  C: "CrossFit Fun",
};

export default function TodayPage() {
  const toast = useToast().toast;
  const [weekType, setWeekType] = useState<WeekType>("non-kid");
  const { data: suggestion, isLoading, error } = useSuggestion(weekType);
  const { data: recovery } = useRecoveryCheckins(1);
  const quickLog = useQuickLog();

  const [exercises, setExercises] = useState<ExerciseState[] | null>(null);
  const [sessionStarted, setSessionStarted] = useState(false);
  const [overallRPE, setOverallRPE] = useState<number>(7);
  const [notes, setNotes] = useState("");

  // Initialize exercise state from suggestion
  const startSession = useCallback(() => {
    if (!suggestion) return;
    const initial = suggestion.suggestedExercises.map((ex) => ({
      name: ex.name,
      exerciseId: ex.exerciseId,
      suggestedWeight: ex.suggestedWeight,
      sets: Array.from({ length: 3 }, () => ({
        done: false,
        weight: ex.suggestedWeight,
        reps: 8,
        rpe: 7,
      })),
    }));
    setExercises(initial);
    setSessionStarted(true);
  }, [suggestion]);

  const toggleSet = (exIdx: number, setIdx: number) => {
    setExercises((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], done: !ex.sets[setIdx].done };
      next[exIdx] = ex;
      return next;
    });
  };

  const updateSet = (
    exIdx: number,
    setIdx: number,
    field: keyof SetState,
    value: number
  ) => {
    setExercises((prev) => {
      if (!prev) return prev;
      const next = [...prev];
      const ex = { ...next[exIdx], sets: [...next[exIdx].sets] };
      ex.sets[setIdx] = { ...ex.sets[setIdx], [field]: value };
      next[exIdx] = ex;
      return next;
    });
  };

  const logSession = async () => {
    if (!exercises || !suggestion) return;

    const completedExercises = exercises.filter((ex) =>
      ex.sets.some((s) => s.done)
    );

    if (completedExercises.length === 0) {
      toast("Complete at least one set first", "error");
      return;
    }

    try {
      await quickLog.mutateAsync({
        sessionType: suggestion.recommendedSession,
        weekType,
        overallRPE,
        notes: notes || undefined,
        exercises: completedExercises.map((ex) => ({
          name: ex.name,
          weight: ex.sets.find((s) => s.done)?.weight ?? 0,
          sets: ex.sets.filter((s) => s.done).length,
          reps: ex.sets.find((s) => s.done)?.reps ?? 8,
          rpe: Math.round(
            ex.sets
              .filter((s) => s.done)
              .reduce((sum, s) => sum + s.rpe, 0) /
              ex.sets.filter((s) => s.done).length
          ),
        })),
      });
      toast("Session logged");
      setSessionStarted(false);
      setExercises(null);
      setNotes("");
    } catch {
      toast("Failed to log session", "error");
    }
  };

  const todayRecovery = recovery?.[0];
  const totalSets = exercises
    ? exercises.reduce((sum, ex) => sum + ex.sets.length, 0)
    : 0;
  const completedSets = exercises
    ? exercises.reduce(
        (sum, ex) => sum + ex.sets.filter((s) => s.done).length,
        0
      )
    : 0;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (error) {
    return (
      <div className="py-8 text-center text-red-500">
        Failed to load suggestion. Check your connection.
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold">
            {sessionStarted ? "Logging Session" : "Today's Session"}
          </h1>
          {suggestion && (
            <p className="text-sm text-gray-500 mt-0.5">
              Session {suggestion.recommendedSession} —{" "}
              {SESSION_NAMES[suggestion.recommendedSession] || "Custom"}
            </p>
          )}
        </div>
        {/* Week type toggle */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-0.5">
          {(["non-kid", "kid"] as WeekType[]).map((wt) => (
            <button
              key={wt}
              onClick={() => setWeekType(wt)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${
                weekType === wt
                  ? "bg-white text-brand-700 shadow-sm"
                  : "text-gray-500"
              }`}
            >
              {wt === "kid" ? "Kid Week" : "No Kids"}
            </button>
          ))}
        </div>
      </div>

      {/* Recovery status banner */}
      {todayRecovery && (
        <div
          className={`rounded-lg px-3 py-2 text-sm ${
            todayRecovery.soreness === "sore" ||
            todayRecovery.sleepQuality === "bad"
              ? "bg-amber-50 text-amber-800"
              : "bg-green-50 text-green-800"
          }`}
        >
          {todayRecovery.sleepQuality === "bad"
            ? "Poor sleep — take it easy today"
            : todayRecovery.soreness === "sore"
              ? "Feeling sore — consider lighter weights"
              : `Feeling good — sleep: ${todayRecovery.sleepQuality}, energy: ${todayRecovery.energy}`}
        </div>
      )}

      {/* Suggestion context */}
      {suggestion && !sessionStarted && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
          <p className="text-sm text-gray-600">{suggestion.rationale}</p>

          {suggestion.lastSession && (
            <p className="text-xs text-gray-400">
              Last session: {suggestion.lastSession.type} (
              {suggestion.lastSession.daysAgo} days ago)
            </p>
          )}

          {/* Exercise preview */}
          <div className="space-y-2">
            {suggestion.suggestedExercises.map((ex) => (
              <div
                key={ex.exerciseId}
                className="flex items-center justify-between py-1.5"
              >
                <span className="text-sm font-medium">{ex.name}</span>
                <span className="text-sm text-gray-500">
                  {ex.suggestedWeight > 0
                    ? `${ex.suggestedWeight}kg`
                    : "Bodyweight"}
                  {ex.lastWeight !== null && ex.suggestedWeight > ex.lastWeight
                    ? " ↑"
                    : ""}
                </span>
              </div>
            ))}
          </div>

          <button
            onClick={startSession}
            className="w-full bg-brand-600 text-white font-semibold py-3 rounded-xl tap-target text-base active:bg-brand-700 transition-colors"
          >
            Start Session
          </button>
        </div>
      )}

      {/* Active session logging */}
      {sessionStarted && exercises && (
        <div className="space-y-4">
          {/* Progress bar */}
          <div className="bg-gray-200 rounded-full h-2">
            <div
              className="bg-brand-600 rounded-full h-2 transition-all"
              style={{
                width: `${totalSets > 0 ? (completedSets / totalSets) * 100 : 0}%`,
              }}
            />
          </div>
          <p className="text-xs text-gray-500 text-center">
            {completedSets} / {totalSets} sets
          </p>

          {/* Exercise cards */}
          {exercises.map((ex, exIdx) => (
            <div
              key={ex.exerciseId}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden"
            >
              <div className="px-4 py-3 border-b border-gray-100">
                <h3 className="font-semibold text-sm">{ex.name}</h3>
                <p className="text-xs text-gray-400">
                  Target: {ex.suggestedWeight > 0 ? `${ex.suggestedWeight}kg` : "BW"}
                </p>
              </div>

              <div className="divide-y divide-gray-50">
                {ex.sets.map((set, setIdx) => (
                  <div
                    key={setIdx}
                    className={`flex items-center gap-3 px-4 py-3 ${
                      set.done ? "bg-brand-50/50" : ""
                    }`}
                  >
                    {/* Set number + done toggle */}
                    <button
                      onClick={() => toggleSet(exIdx, setIdx)}
                      className={`flex items-center justify-center w-8 h-8 rounded-full border-2 transition-colors tap-target ${
                        set.done
                          ? "bg-brand-600 border-brand-600 text-white"
                          : "border-gray-300 text-gray-400"
                      }`}
                    >
                      {set.done ? (
                        <svg
                          className="w-4 h-4"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2.5}
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      ) : (
                        <span className="text-xs font-bold">
                          {setIdx + 1}
                        </span>
                      )}
                    </button>

                    {/* Weight */}
                    <div className="flex-1">
                      <label className="text-[10px] text-gray-400 uppercase">
                        kg
                      </label>
                      <input
                        type="number"
                        value={set.weight || ""}
                        onChange={(e) =>
                          updateSet(
                            exIdx,
                            setIdx,
                            "weight",
                            parseFloat(e.target.value) || 0
                          )
                        }
                        className="w-full text-sm font-mono bg-transparent border-b border-gray-200 focus:border-brand-500 outline-none py-0.5"
                        step={2.5}
                        inputMode="decimal"
                      />
                    </div>

                    {/* Reps */}
                    <div className="w-14">
                      <label className="text-[10px] text-gray-400 uppercase">
                        Reps
                      </label>
                      <input
                        type="number"
                        value={set.reps || ""}
                        onChange={(e) =>
                          updateSet(
                            exIdx,
                            setIdx,
                            "reps",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full text-sm font-mono bg-transparent border-b border-gray-200 focus:border-brand-500 outline-none py-0.5"
                        inputMode="numeric"
                      />
                    </div>

                    {/* RPE */}
                    <div className="w-12">
                      <label className="text-[10px] text-gray-400 uppercase">
                        RPE
                      </label>
                      <input
                        type="number"
                        value={set.rpe || ""}
                        onChange={(e) =>
                          updateSet(
                            exIdx,
                            setIdx,
                            "rpe",
                            parseInt(e.target.value) || 0
                          )
                        }
                        className="w-full text-sm font-mono bg-transparent border-b border-gray-200 focus:border-brand-500 outline-none py-0.5"
                        min={1}
                        max={10}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* Session notes + RPE */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
            <div>
              <label className="text-xs text-gray-500 font-medium">
                Overall RPE
              </label>
              <div className="flex gap-1 mt-1">
                {[5, 6, 7, 8, 9, 10].map((rpe) => (
                  <button
                    key={rpe}
                    onClick={() => setOverallRPE(rpe)}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors tap-target ${
                      overallRPE === rpe
                        ? "bg-brand-600 text-white"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    {rpe}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs text-gray-500 font-medium">
                Notes (optional)
              </label>
              <input
                type="text"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="How did it feel?"
                className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:border-brand-500 outline-none"
              />
            </div>
          </div>

          {/* Log button */}
          <button
            onClick={logSession}
            disabled={quickLog.isPending || completedSets === 0}
            className={`w-full font-semibold py-4 rounded-xl tap-target text-base transition-colors ${
              completedSets > 0
                ? "bg-brand-600 text-white active:bg-brand-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {quickLog.isPending
              ? "Logging..."
              : `Log Session (${completedSets} sets)`}
          </button>
        </div>
      )}

      {/* Running load context */}
      {suggestion && (
        <div className="text-xs text-gray-400 text-center">
          Running load (7d): {suggestion.runningLoadLast7Days} | Week type:{" "}
          {weekType}
        </div>
      )}
    </div>
  );
}
