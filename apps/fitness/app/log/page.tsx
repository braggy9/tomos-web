"use client";

import { useState } from "react";
import { useSuggestion, useQuickLog } from "../../hooks/useFitness";
import { ExerciseRow } from "../../components/ExerciseRow";
import { WeekTypeToggle } from "../../components/WeekTypeToggle";
import { Spinner } from "@tomos/ui";
import { useRouter } from "next/navigation";
import type { FitnessWeekType } from "@tomos/api";

interface ExerciseInput {
  name: string;
  exerciseId: string;
  weight: number;
  sets: number;
  reps: number;
  rpe: number;
  suggestedWeight: number;
  suggestedSets?: number;
  suggestedReps?: number;
}

export default function LogPage() {
  const router = useRouter();
  const [weekType, setWeekType] = useState<FitnessWeekType>("non-kid");
  const [sessionType, setSessionType] = useState("A");
  const [notes, setNotes] = useState("");
  const [overallRPE, setOverallRPE] = useState(7);
  const [exercises, setExercises] = useState<ExerciseInput[]>([]);
  const [initialized, setInitialized] = useState(false);

  const { data: suggestion, isLoading } = useSuggestion(weekType);
  const quickLogMutation = useQuickLog();

  // Initialize exercises from suggestion
  if (suggestion && !initialized) {
    setSessionType(suggestion.recommendedSession);
    setExercises(
      suggestion.suggestedExercises.map((ex) => ({
        name: ex.name,
        exerciseId: ex.exerciseId,
        weight: ex.suggestedWeight,
        sets: ex.suggestedSets ?? 4,
        reps: ex.suggestedReps ?? 6,
        rpe: 0,
        suggestedWeight: ex.suggestedWeight,
        suggestedSets: ex.suggestedSets,
        suggestedReps: ex.suggestedReps,
      }))
    );
    setInitialized(true);
  }

  const updateExercise = (index: number, field: keyof ExerciseInput, value: number) => {
    setExercises((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const handleSubmit = () => {
    quickLogMutation.mutate(
      {
        sessionType,
        weekType,
        notes: notes || undefined,
        overallRPE: overallRPE || undefined,
        exercises: exercises.map((ex) => ({
          name: ex.name,
          weight: ex.weight || undefined,
          sets: ex.sets,
          reps: ex.reps || undefined,
          rpe: ex.rpe || undefined,
        })),
      },
      {
        onSuccess: () => router.push("/history"),
      }
    );
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Log Session</h1>

      {/* Session type and week type */}
      <div className="flex items-center gap-3 mb-4">
        <div className="flex bg-gray-100 rounded-lg p-0.5">
          {["A", "B", "C"].map((type) => (
            <button
              key={type}
              onClick={() => setSessionType(type)}
              className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                sessionType === type
                  ? "bg-white text-gray-900 shadow-sm"
                  : "text-gray-500 hover:text-gray-700"
              }`}
            >
              {type}
            </button>
          ))}
        </div>
        <WeekTypeToggle value={weekType} onChange={setWeekType} />
      </div>

      {isLoading && (
        <div className="flex justify-center py-8">
          <Spinner />
        </div>
      )}

      {/* Exercise rows */}
      <div className="space-y-3 mb-4">
        {exercises.map((ex, i) => (
          <ExerciseRow
            key={ex.exerciseId}
            name={ex.name}
            suggestedWeight={ex.suggestedWeight}
            suggestedSets={ex.suggestedSets}
            suggestedReps={ex.suggestedReps}
            weight={ex.weight}
            sets={ex.sets}
            reps={ex.reps}
            rpe={ex.rpe}
            onWeightChange={(v) => updateExercise(i, "weight", v)}
            onSetsChange={(v) => updateExercise(i, "sets", v)}
            onRepsChange={(v) => updateExercise(i, "reps", v)}
            onRPEChange={(v) => updateExercise(i, "rpe", v)}
          />
        ))}
      </div>

      {/* Overall RPE */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 block mb-1">Overall RPE</label>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((v) => (
            <button
              key={v}
              onClick={() => setOverallRPE(v)}
              className={`flex-1 py-1.5 rounded-lg text-xs font-medium transition-all ${
                overallRPE === v
                  ? "bg-brand-100 text-brand-700 ring-1 ring-brand-300"
                  : "bg-gray-50 text-gray-400 hover:bg-gray-100"
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div className="mb-4">
        <label className="text-xs text-gray-400 block mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="How did it feel?"
          rows={2}
          className="w-full px-3 py-2 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200 resize-none"
        />
      </div>

      {/* Submit */}
      <button
        onClick={handleSubmit}
        disabled={quickLogMutation.isPending || exercises.length === 0}
        className="w-full py-3 rounded-xl bg-brand-600 text-white text-sm font-semibold hover:bg-brand-700 transition-colors disabled:opacity-50"
      >
        {quickLogMutation.isPending ? "Logging..." : "Log Session"}
      </button>
    </div>
  );
}
