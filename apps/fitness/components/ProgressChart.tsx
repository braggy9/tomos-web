"use client";

import { Card } from "@tomos/ui";
import type { FitnessProgressData } from "@tomos/api";

interface ProgressChartProps {
  data: FitnessProgressData;
}

export function ProgressChart({ data }: ProgressChartProps) {
  if (data.dataPoints.length === 0) {
    return (
      <Card>
        <p className="text-sm text-gray-400 text-center py-4">No data for this exercise yet.</p>
      </Card>
    );
  }

  const weights = data.dataPoints.map((d) => d.weight);
  const maxWeight = Math.max(...weights);
  const minWeight = Math.min(...weights);
  const range = maxWeight - minWeight || 1;

  return (
    <Card>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        {data.exerciseName} — Weight Progression
      </p>
      <div className="flex items-end gap-1 h-32">
        {data.dataPoints.map((point, i) => {
          const height = ((point.weight - minWeight) / range) * 80 + 20; // 20-100% range
          return (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <span className="text-[9px] text-gray-400">{point.weight}</span>
              <div
                className="w-full rounded-t bg-brand-400 transition-all hover:bg-brand-500"
                style={{ height: `${height}%` }}
                title={`${point.date}: ${point.weight}kg${point.reps ? ` x${point.reps}` : ""}`}
              />
              <span className="text-[8px] text-gray-300">
                {new Date(point.date).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex justify-between mt-2 text-[10px] text-gray-400">
        <span>Min: {minWeight}kg</span>
        <span>Max: {maxWeight}kg</span>
        <span>{data.dataPoints.length} sessions</span>
      </div>
    </Card>
  );
}
