"use client";

import { WeekView } from "../../components/WeekView";
import { useTrainingBlocks } from "../../hooks/useTraining";

const PHASE_COLOR: Record<string, string> = {
  rebuild: "bg-blue-50 text-blue-700 border-blue-200",
  base: "bg-green-50 text-green-700 border-green-200",
  build: "bg-orange-50 text-orange-700 border-orange-200",
  specific: "bg-purple-50 text-purple-700 border-purple-200",
  taper: "bg-amber-50 text-amber-700 border-amber-200",
  race: "bg-red-50 text-red-700 border-red-200",
};

export default function PlanPage() {
  const { data: blocks } = useTrainingBlocks();

  const activeBlock = blocks?.find((b) => b.status === "active");
  const upcomingBlocks = blocks?.filter((b) => b.status === "planned") || [];

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Training Plan</h1>

      {/* Current week view */}
      <WeekView />

      {/* Block overview */}
      {blocks && blocks.length > 0 && (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Blocks
          </h2>
          <div className="space-y-2">
            {blocks.map((block) => {
              const phaseStyle =
                PHASE_COLOR[block.phase] ||
                "bg-gray-50 text-gray-700 border-gray-200";
              const isActive = block.status === "active";
              return (
                <div
                  key={block.id}
                  className={`flex items-center justify-between p-3 rounded-lg border ${
                    isActive
                      ? "border-brand-300 bg-brand-50/30"
                      : "border-gray-200 bg-white"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-xs font-medium px-2 py-0.5 rounded-full border ${phaseStyle}`}
                    >
                      {block.phase}
                    </span>
                    <span className="text-sm font-medium text-gray-900">
                      {block.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    {block.targetWeeklyKm && (
                      <span className="text-xs text-gray-400">
                        {block.targetWeeklyKm}km/wk
                      </span>
                    )}
                    <span
                      className={`text-xs font-medium ${
                        isActive
                          ? "text-brand-600"
                          : block.status === "completed"
                            ? "text-green-600"
                            : "text-gray-400"
                      }`}
                    >
                      {block.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
