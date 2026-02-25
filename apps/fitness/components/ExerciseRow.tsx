"use client";

interface ExerciseRowProps {
  name: string;
  suggestedWeight: number;
  suggestedSets?: number;
  suggestedReps?: number;
  weight: number;
  sets: number;
  reps: number;
  rpe: number;
  onWeightChange: (v: number) => void;
  onSetsChange: (v: number) => void;
  onRepsChange: (v: number) => void;
  onRPEChange: (v: number) => void;
}

export function ExerciseRow({
  name,
  suggestedWeight,
  suggestedSets,
  suggestedReps,
  weight,
  sets,
  reps,
  rpe,
  onWeightChange,
  onSetsChange,
  onRepsChange,
  onRPEChange,
}: ExerciseRowProps) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-medium text-gray-900">{name}</p>
        {suggestedWeight > 0 && (
          <button
            onClick={() => {
              onWeightChange(suggestedWeight);
              if (suggestedSets) onSetsChange(suggestedSets);
              if (suggestedReps) onRepsChange(suggestedReps);
            }}
            className="text-[10px] text-brand-600 hover:text-brand-700 font-medium"
          >
            Use suggestion ({suggestedWeight}kg)
          </button>
        )}
      </div>
      <div className="grid grid-cols-4 gap-2">
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Weight (kg)</label>
          <input
            type="number"
            value={weight || ""}
            onChange={(e) => onWeightChange(Number(e.target.value))}
            step="1.25"
            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Sets</label>
          <input
            type="number"
            value={sets || ""}
            onChange={(e) => onSetsChange(Number(e.target.value))}
            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">Reps</label>
          <input
            type="number"
            value={reps || ""}
            onChange={(e) => onRepsChange(Number(e.target.value))}
            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
          />
        </div>
        <div>
          <label className="text-[10px] text-gray-400 block mb-0.5">RPE</label>
          <input
            type="number"
            value={rpe || ""}
            onChange={(e) => onRPEChange(Number(e.target.value))}
            min="1"
            max="10"
            className="w-full px-2 py-1.5 rounded-lg border border-gray-200 text-sm text-center focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200"
          />
        </div>
      </div>
    </div>
  );
}
