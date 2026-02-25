"use client";

import { Card } from "@tomos/ui";
import type { FitnessDailyPlan } from "@tomos/api";

interface SuggestionCardProps {
  plan: FitnessDailyPlan;
}

export function SuggestionCard({ plan }: SuggestionCardProps) {
  const suggestion = plan.suggestion;
  const wod = suggestion?.wod;

  return (
    <Card className="border-brand-200 bg-gradient-to-br from-brand-50 to-white">
      <div className="flex items-start justify-between mb-3">
        <div>
          <p className="text-xs font-medium text-brand-600 uppercase tracking-wider mb-1">
            Today's Plan
          </p>
          <h2 className="text-lg font-bold text-gray-900 leading-tight">
            {plan.headline}
          </h2>
        </div>
        {plan.shouldTrain ? (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-brand-100 text-brand-700">
            Train
          </span>
        ) : (
          <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
            Rest
          </span>
        )}
      </div>

      {/* WOD format badge for Session C */}
      {wod && plan.shouldTrain && (
        <div className="mb-3 px-3 py-2 rounded-lg bg-orange-50 border border-orange-100">
          <div className="flex items-center justify-between">
            <span className="text-sm font-bold text-orange-700">{wod.name}</span>
            {wod.duration && (
              <span className="text-xs text-orange-500">{wod.duration} min</span>
            )}
          </div>
          <p className="text-xs text-orange-600 mt-0.5">{wod.description}</p>
        </div>
      )}

      {suggestion && plan.shouldTrain && (
        <div className="space-y-2 mt-3">
          {suggestion.suggestedExercises.map((ex) => (
            <div
              key={ex.exerciseId}
              className="flex items-center justify-between py-1.5 border-b border-gray-100 last:border-0"
            >
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-gray-800">{ex.name}</span>
                {ex.confidence && (
                  <span className={`w-1.5 h-1.5 rounded-full ${
                    ex.confidence === 'high' ? 'bg-brand-400' :
                    ex.confidence === 'medium' ? 'bg-amber-400' : 'bg-gray-300'
                  }`} />
                )}
              </div>
              <div className="flex items-center gap-3 text-sm">
                {ex.suggestedWeight > 0 && (
                  <span className="font-semibold text-gray-900">{ex.suggestedWeight}kg</span>
                )}
                {ex.suggestedReps != null && ex.suggestedReps > 0 && (
                  <span className="text-gray-400">
                    {wod ? `${ex.suggestedReps} reps` : ex.suggestedSets ? `${ex.suggestedSets}x${ex.suggestedReps}` : `x${ex.suggestedReps}`}
                  </span>
                )}
                {ex.lastWeight != null && ex.lastWeight !== ex.suggestedWeight && (
                  <span className="text-xs text-gray-400">
                    was {ex.lastWeight}kg
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="text-xs text-gray-400 mt-3">{plan.context}</p>
    </Card>
  );
}
