"use client";

import { Card } from "@tomos/ui";
import type { FitnessRunningLoadContext } from "@tomos/api";

interface RunningLoadCardProps {
  context: FitnessRunningLoadContext;
}

export function RunningLoadCard({ context }: RunningLoadCardProps) {
  const acwrColor =
    context.acwr > 1.3 ? "text-red-600" :
    context.acwr >= 0.8 ? "text-brand-600" :
    "text-amber-600";

  const loadColor =
    context.loadFactor === "high" ? "bg-red-400" :
    context.loadFactor === "moderate" ? "bg-amber-400" :
    "bg-brand-400";

  const trendIcon =
    context.trend === "increasing" ? "\u2191" :
    context.trend === "decreasing" ? "\u2193" : "\u2192";

  return (
    <Card>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">Running Load</p>
      <div className="flex items-end justify-between mb-3">
        <div>
          <p className="text-2xl font-bold text-gray-900">{context.weeklyLoad}</p>
          <p className="text-xs text-gray-400">7-day load</p>
        </div>
        <div className="text-right">
          <p className={`text-lg font-bold ${acwrColor}`}>{context.acwr}</p>
          <p className="text-xs text-gray-400">ACWR</p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold text-gray-700">{trendIcon}</p>
          <p className="text-xs text-gray-400">{context.trend}</p>
        </div>
      </div>

      {/* Load bar */}
      <div className="w-full bg-gray-100 rounded-full h-2 mb-2">
        <div
          className={`h-2 rounded-full transition-all ${loadColor}`}
          style={{ width: `${Math.min(100, (context.weeklyLoad / (context.chronicLoad / 4 * 1.5 || 600)) * 100)}%` }}
        />
      </div>

      <p className="text-xs text-gray-500">{context.recommendation}</p>
    </Card>
  );
}
