"use client";

import { useState } from "react";
import { useCreateActivity, useTodayActivities } from "../hooks/useRunning";
import { useToast } from "@tomos/ui";

const ACTIVITY_TYPES = [
  { value: "swim", label: "Swim", icon: "🏊", hasDistance: true },
  { value: "mobility", label: "Mobility", icon: "🧘", hasDistance: false },
  { value: "yoga", label: "Yoga", icon: "🧘‍♂️", hasDistance: false },
  { value: "cross-train", label: "Cross-train", icon: "🚴", hasDistance: true },
  { value: "walk", label: "Walk", icon: "🚶", hasDistance: true },
  { value: "workout", label: "Workout", icon: "💪", hasDistance: false },
];

const MOOD_OPTIONS = [
  { value: 1, emoji: "😫" },
  { value: 2, emoji: "😕" },
  { value: 3, emoji: "😐" },
  { value: 4, emoji: "😊" },
  { value: 5, emoji: "🤩" },
];

const TYPE_BADGE_COLORS: Record<string, string> = {
  swim: "bg-cyan-50 text-cyan-700 border-cyan-200",
  mobility: "bg-green-50 text-green-700 border-green-200",
  yoga: "bg-purple-50 text-purple-700 border-purple-200",
  "cross-train": "bg-orange-50 text-orange-700 border-orange-200",
  walk: "bg-amber-50 text-amber-700 border-amber-200",
  workout: "bg-pink-50 text-pink-700 border-pink-200",
};

export function ActivityLogPanel() {
  const toast = useToast().toast;
  const createActivity = useCreateActivity();
  const { data: todayData } = useTodayActivities();

  const [activityType, setActivityType] = useState("swim");
  const [duration, setDuration] = useState("");
  const [distance, setDistance] = useState("");
  const [notes, setNotes] = useState("");
  const [rpe, setRpe] = useState<number | null>(null);
  const [mood, setMood] = useState<number | null>(null);

  const selectedType = ACTIVITY_TYPES.find((t) => t.value === activityType);
  const showDistance = selectedType?.hasDistance ?? false;
  const todayActivities = todayData?.activities || [];

  const handleSubmit = async () => {
    const dur = parseInt(duration);
    if (!dur || dur < 1) {
      toast("Duration is required", "error");
      return;
    }

    try {
      await createActivity.mutateAsync({
        activityType,
        duration: dur,
        distance: showDistance && distance ? parseFloat(distance) : undefined,
        rpe: rpe ?? undefined,
        moodPost: mood ?? undefined,
        notes: notes || undefined,
      });
      toast("Activity logged");
      setDuration("");
      setDistance("");
      setNotes("");
      setRpe(null);
      setMood(null);
    } catch {
      toast("Failed to log activity", "error");
    }
  };

  return (
    <div className="space-y-4">
      {/* Activity type selector */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">Activity Type</p>
        <div className="grid grid-cols-3 gap-2">
          {ACTIVITY_TYPES.map((t) => (
            <button
              key={t.value}
              onClick={() => setActivityType(t.value)}
              className={`py-3 rounded-xl text-center transition-colors tap-target ${
                activityType === t.value
                  ? "bg-brand-100 border-2 border-brand-500"
                  : "bg-gray-50 border-2 border-transparent"
              }`}
            >
              <span className="text-xl block">{t.icon}</span>
              <span className="text-[11px] font-medium text-gray-600 mt-1 block">
                {t.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Duration + Distance */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <div>
          <label className="text-sm font-medium text-gray-700">
            Duration (minutes) *
          </label>
          <input
            type="number"
            value={duration}
            onChange={(e) => setDuration(e.target.value)}
            placeholder="45"
            className="mt-1 w-full px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none"
          />
        </div>
        {showDistance && (
          <div>
            <label className="text-sm font-medium text-gray-700">
              Distance (km)
            </label>
            <input
              type="number"
              step="0.1"
              value={distance}
              onChange={(e) => setDistance(e.target.value)}
              placeholder="1.5"
              className="mt-1 w-full px-3 py-2.5 bg-gray-50 rounded-lg border border-gray-200 text-sm focus:border-brand-500 outline-none"
            />
          </div>
        )}
      </div>

      {/* RPE */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          Effort (RPE)
        </p>
        <div className="flex gap-1">
          {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((r) => (
            <button
              key={r}
              onClick={() => setRpe(rpe === r ? null : r)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors tap-target ${
                rpe === r
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {r}
            </button>
          ))}
        </div>
      </div>

      {/* Mood */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <p className="text-sm font-medium text-gray-700 mb-2">
          How do you feel?
        </p>
        <div className="flex gap-2">
          {MOOD_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMood(mood === opt.value ? null : opt.value)}
              className={`flex-1 py-3 rounded-xl text-center transition-colors tap-target ${
                mood === opt.value
                  ? "bg-brand-100 border-2 border-brand-500"
                  : "bg-gray-50 border-2 border-transparent"
              }`}
            >
              <span className="text-2xl block">{opt.emoji}</span>
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
        disabled={createActivity.isPending || !duration}
        className="w-full bg-brand-600 text-white font-semibold py-4 rounded-xl tap-target text-base active:bg-brand-700 transition-colors disabled:opacity-50"
      >
        {createActivity.isPending ? "Saving..." : "Log Activity"}
      </button>

      {/* Today's activities */}
      {todayActivities.length > 0 && (
        <div className="space-y-2">
          <h3 className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
            Today
          </h3>
          {todayActivities.map((a) => {
            const badgeStyle =
              TYPE_BADGE_COLORS[a.activityType] ||
              "bg-gray-50 text-gray-700 border-gray-200";
            return (
              <div
                key={a.id}
                className="bg-white rounded-xl border border-gray-200 p-3 flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-full border ${badgeStyle} capitalize`}
                  >
                    {a.activityType}
                  </span>
                  <span className="text-sm text-gray-700">
                    {a.activityName || a.activityType}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-gray-400">
                  <span>{a.duration}m</span>
                  {a.distance && <span>{a.distance}km</span>}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
