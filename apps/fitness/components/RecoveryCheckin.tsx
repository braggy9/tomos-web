"use client";

import { useState } from "react";
import { Card } from "@tomos/ui";
import { useCreateCheckIn, useTodayRecovery } from "../hooks/useRecovery";
import type { FitnessRecoveryCheckIn } from "@tomos/api";

const metrics = [
  { key: "sleepQuality", label: "Sleep", emoji: ["😴", "😪", "😐", "😊", "🌟"] },
  { key: "soreness", label: "Soreness", emoji: ["🔴", "🟠", "🟡", "🟢", "💪"] },
  { key: "energy", label: "Energy", emoji: ["🪫", "😮‍💨", "😐", "⚡", "🔥"] },
  { key: "motivation", label: "Motivation", emoji: ["😒", "🤷", "😐", "😤", "🏋️"] },
] as const;

function ReadinessDisplay({ checkin }: { checkin: FitnessRecoveryCheckIn }) {
  const score = checkin.readinessScore ?? 0;
  const color = score >= 4 ? "text-brand-600" : score >= 3 ? "text-amber-600" : "text-red-500";

  return (
    <Card>
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-gray-400 uppercase tracking-wider">Readiness</p>
          <p className={`text-2xl font-bold ${color}`}>{score.toFixed(1)}<span className="text-sm text-gray-400">/5</span></p>
        </div>
        <div className="flex gap-3 text-sm">
          {metrics.map((m) => (
            <div key={m.key} className="text-center">
              <p className="text-lg">{m.emoji[(checkin[m.key as keyof FitnessRecoveryCheckIn] as number) - 1]}</p>
              <p className="text-[10px] text-gray-400">{m.label}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}

export function RecoveryCheckin() {
  const { data: todayCheckin, isLoading } = useTodayRecovery();
  const createMutation = useCreateCheckIn();
  const [values, setValues] = useState({ sleepQuality: 3, soreness: 3, energy: 3, motivation: 3 });

  if (isLoading) return null;

  if (todayCheckin) {
    return <ReadinessDisplay checkin={todayCheckin} />;
  }

  const handleSubmit = () => {
    createMutation.mutate(values);
  };

  return (
    <Card>
      <p className="text-xs font-medium text-gray-400 uppercase tracking-wider mb-3">
        How are you feeling?
      </p>
      <div className="space-y-3">
        {metrics.map((m) => (
          <div key={m.key} className="flex items-center gap-3">
            <span className="text-xs text-gray-500 w-16">{m.label}</span>
            <div className="flex gap-1 flex-1">
              {[1, 2, 3, 4, 5].map((v) => (
                <button
                  key={v}
                  onClick={() => setValues((prev) => ({ ...prev, [m.key]: v }))}
                  className={`flex-1 py-1.5 rounded-lg text-center text-sm transition-all ${
                    values[m.key as keyof typeof values] === v
                      ? "bg-brand-100 text-brand-700 font-medium ring-1 ring-brand-300"
                      : "bg-gray-50 text-gray-400 hover:bg-gray-100"
                  }`}
                >
                  {m.emoji[v - 1]}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>
      <button
        onClick={handleSubmit}
        disabled={createMutation.isPending}
        className="mt-4 w-full py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors disabled:opacity-50"
      >
        {createMutation.isPending ? "Saving..." : "Log Readiness"}
      </button>
    </Card>
  );
}
