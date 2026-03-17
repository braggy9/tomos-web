"use client";

interface NutritionNudgeProps {
  nudge: string | null;
}

export function NutritionNudge({ nudge }: NutritionNudgeProps) {
  if (!nudge) return null;

  return (
    <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-50 border border-amber-100">
      <span className="text-sm">🥗</span>
      <p className="text-xs text-amber-800">{nudge}</p>
    </div>
  );
}
