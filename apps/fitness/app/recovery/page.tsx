"use client";

import { useState } from "react";
import { useRecoveryCheckins, useSubmitRecovery } from "../../hooks/useRecovery";
import { Spinner, useToast } from "@tomos/ui";
import type { SleepQuality, RecoveryEnergy, Soreness } from "@tomos/api";

const sleepOptions: { value: SleepQuality; label: string; emoji: string }[] = [
  { value: "bad", label: "Bad", emoji: "😴" },
  { value: "ok", label: "OK", emoji: "😐" },
  { value: "great", label: "Great", emoji: "😊" },
];

const energyOptions: { value: RecoveryEnergy; label: string; emoji: string }[] = [
  { value: "low", label: "Low", emoji: "🔋" },
  { value: "medium", label: "Medium", emoji: "⚡" },
  { value: "high", label: "High", emoji: "🔥" },
];

const sorenessOptions: { value: Soreness; label: string; emoji: string }[] = [
  { value: "none", label: "None", emoji: "💪" },
  { value: "mild", label: "Mild", emoji: "🤏" },
  { value: "sore", label: "Sore", emoji: "😣" },
];

export default function RecoveryPage() {
  const toast = useToast().toast;
  const { data: checkins, isLoading } = useRecoveryCheckins(14);
  const submit = useSubmitRecovery();

  const [sleep, setSleep] = useState<SleepQuality | null>(null);
  const [energy, setEnergy] = useState<RecoveryEnergy | null>(null);
  const [soreness, setSoreness] = useState<Soreness | null>(null);
  const [notes, setNotes] = useState("");
  const [submitted, setSubmitted] = useState(false);

  // Check if already checked in today
  const today = new Date().toLocaleDateString("en-CA", {
    timeZone: "Australia/Sydney",
  });
  const todayCheckin = checkins?.find((c) =>
    c.date.startsWith(today)
  );

  const handleSubmit = async () => {
    if (!sleep || !energy || !soreness) {
      toast("Select all three", "error");
      return;
    }

    try {
      await submit.mutateAsync({
        sleepQuality: sleep,
        energy,
        soreness,
        notes: notes || undefined,
      });
      toast("Check-in saved");
      setSubmitted(true);
    } catch {
      toast("Failed to save", "error");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-xl font-bold">Recovery Check-in</h1>

      {/* Today's check-in form or confirmation */}
      {todayCheckin && !submitted ? (
        <div className="bg-green-50 rounded-xl border border-green-200 p-4 text-center">
          <p className="text-green-800 font-medium">Already checked in today</p>
          <p className="text-sm text-green-600 mt-1">
            Sleep: {todayCheckin.sleepQuality} | Energy: {todayCheckin.energy} | Soreness: {todayCheckin.soreness}
          </p>
          <button
            onClick={() => {
              setSleep(todayCheckin.sleepQuality);
              setEnergy(todayCheckin.energy);
              setSoreness(todayCheckin.soreness);
              setNotes(todayCheckin.notes || "");
              setSubmitted(false);
            }}
            className="mt-2 text-sm text-green-700 underline"
          >
            Update
          </button>
        </div>
      ) : submitted ? (
        <div className="bg-brand-50 rounded-xl border border-brand-200 p-4 text-center">
          <p className="text-brand-800 font-medium text-lg">Done</p>
          <p className="text-sm text-brand-600 mt-1">
            Have a great{" "}
            {energy === "high"
              ? "high-energy"
              : energy === "low"
                ? "rest"
                : ""}{" "}
            day
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {/* Sleep */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              How did you sleep?
            </p>
            <div className="flex gap-2">
              {sleepOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSleep(opt.value)}
                  className={`flex-1 py-3 rounded-xl text-center transition-colors tap-target ${
                    sleep === opt.value
                      ? "bg-brand-100 border-2 border-brand-500"
                      : "bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <span className="text-2xl block">{opt.emoji}</span>
                  <span className="text-xs font-medium text-gray-600 mt-1 block">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Energy */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Energy level?
            </p>
            <div className="flex gap-2">
              {energyOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setEnergy(opt.value)}
                  className={`flex-1 py-3 rounded-xl text-center transition-colors tap-target ${
                    energy === opt.value
                      ? "bg-brand-100 border-2 border-brand-500"
                      : "bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <span className="text-2xl block">{opt.emoji}</span>
                  <span className="text-xs font-medium text-gray-600 mt-1 block">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Soreness */}
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <p className="text-sm font-medium text-gray-700 mb-2">
              Any soreness?
            </p>
            <div className="flex gap-2">
              {sorenessOptions.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setSoreness(opt.value)}
                  className={`flex-1 py-3 rounded-xl text-center transition-colors tap-target ${
                    soreness === opt.value
                      ? "bg-brand-100 border-2 border-brand-500"
                      : "bg-gray-50 border-2 border-transparent"
                  }`}
                >
                  <span className="text-2xl block">{opt.emoji}</span>
                  <span className="text-xs font-medium text-gray-600 mt-1 block">
                    {opt.label}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <input
            type="text"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Notes (optional)"
            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-200 text-sm focus:border-brand-500 outline-none"
          />

          {/* Submit */}
          <button
            onClick={handleSubmit}
            disabled={!sleep || !energy || !soreness || submit.isPending}
            className={`w-full font-semibold py-4 rounded-xl tap-target text-base transition-colors ${
              sleep && energy && soreness
                ? "bg-brand-600 text-white active:bg-brand-700"
                : "bg-gray-200 text-gray-400 cursor-not-allowed"
            }`}
          >
            {submit.isPending ? "Saving..." : "Check In"}
          </button>
        </div>
      )}

      {/* Recent check-ins */}
      {checkins && checkins.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-500 uppercase tracking-wider mb-3">
            Recent
          </h2>
          <div className="space-y-2">
            {checkins.slice(0, 7).map((c) => {
              const d = new Date(c.date);
              return (
                <div
                  key={c.id}
                  className="flex items-center justify-between text-sm"
                >
                  <span className="text-gray-500">
                    {d.toLocaleDateString("en-AU", {
                      weekday: "short",
                      day: "numeric",
                      month: "short",
                      timeZone: "Australia/Sydney",
                    })}
                  </span>
                  <div className="flex items-center gap-3 text-xs text-gray-400">
                    <span>
                      Sleep:{" "}
                      {c.sleepQuality === "great"
                        ? "😊"
                        : c.sleepQuality === "ok"
                          ? "😐"
                          : "😴"}
                    </span>
                    <span>
                      Energy:{" "}
                      {c.energy === "high"
                        ? "🔥"
                        : c.energy === "medium"
                          ? "⚡"
                          : "🔋"}
                    </span>
                    <span>
                      {c.soreness === "sore"
                        ? "😣"
                        : c.soreness === "mild"
                          ? "🤏"
                          : "💪"}
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
