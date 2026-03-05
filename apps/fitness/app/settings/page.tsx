"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useSettings, useUpdateSettings } from "../../hooks/useSettings";
import { useHRZones } from "../../hooks/useRunning";
import { Spinner, useToast } from "@tomos/ui";

const ZONE_COLORS = [
  "bg-gray-300",
  "bg-blue-400",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
];

export default function SettingsPage() {
  const toast = useToast().toast;
  const router = useRouter();
  const { data: settings, isLoading } = useSettings();
  const { data: zones } = useHRZones();
  const updateSettings = useUpdateSettings();

  const [maxHR, setMaxHR] = useState(192);
  const [restingHR, setRestingHR] = useState<string>("");
  const [weekType, setWeekType] = useState("non-kid");

  useEffect(() => {
    if (settings) {
      setMaxHR(settings.maxHeartRate);
      setRestingHR(settings.restingHR?.toString() ?? "");
      setWeekType(settings.defaultWeekType);
    }
  }, [settings]);

  const handleSave = async () => {
    try {
      await updateSettings.mutateAsync({
        maxHeartRate: maxHR,
        restingHR: restingHR ? parseInt(restingHR) : null,
        defaultWeekType: weekType,
      });
      toast("Settings saved");
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
    <div className="space-y-4">
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-brand-600 font-medium mb-2"
        >
          &larr; Back
        </button>
        <h1 className="text-xl font-bold">Settings</h1>
      </div>

      {/* Heart Rate */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Heart Rate</h2>

        <div>
          <label className="text-xs text-gray-500 font-medium">
            Max Heart Rate (bpm)
          </label>
          <input
            type="number"
            value={maxHR}
            onChange={(e) => setMaxHR(parseInt(e.target.value) || 192)}
            className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:border-brand-500 outline-none"
            inputMode="numeric"
          />
        </div>

        <div>
          <label className="text-xs text-gray-500 font-medium">
            Resting Heart Rate (bpm, optional)
          </label>
          <input
            type="number"
            value={restingHR}
            onChange={(e) => setRestingHR(e.target.value)}
            placeholder="e.g., 55"
            className="w-full mt-1 px-3 py-2 text-sm bg-gray-50 rounded-lg border border-gray-200 focus:border-brand-500 outline-none"
            inputMode="numeric"
          />
        </div>
      </div>

      {/* HR Zones display */}
      {zones && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-3">
            HR Zones (based on {zones.maxHeartRate} bpm max)
          </h2>
          <div className="space-y-2">
            {zones.zones.map((z, i) => (
              <div key={z.zone} className="flex items-center gap-3">
                <span
                  className={`w-8 h-8 rounded-lg ${ZONE_COLORS[i]} flex items-center justify-center text-white text-xs font-bold`}
                >
                  Z{z.zone}
                </span>
                <div className="flex-1">
                  <p className="text-sm font-medium">{z.name}</p>
                  <p className="text-xs text-gray-400">
                    {z.min}–{z.max} bpm
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Default week type */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <h2 className="text-sm font-semibold text-gray-700 mb-2">
          Default Week Type
        </h2>
        <div className="flex gap-2">
          {["non-kid", "kid"].map((wt) => (
            <button
              key={wt}
              onClick={() => setWeekType(wt)}
              className={`flex-1 py-2 rounded-lg text-sm font-medium transition-colors ${
                weekType === wt
                  ? "bg-brand-600 text-white"
                  : "bg-gray-100 text-gray-600"
              }`}
            >
              {wt === "kid" ? "Kid Week" : "No Kids"}
            </button>
          ))}
        </div>
      </div>

      {/* Integrations */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 space-y-3">
        <h2 className="text-sm font-semibold text-gray-700">Integrations</h2>

        <div className="flex items-center justify-between py-2">
          <div>
            <p className="text-sm font-medium">Strava</p>
            <p className="text-xs text-gray-400">Running activity sync</p>
          </div>
          <a
            href="https://tomos-task-api.vercel.app/api/gym/sync/strava/auth"
            className="px-3 py-1.5 text-xs font-medium text-brand-600 bg-brand-50 rounded-lg hover:bg-brand-100 transition-colors"
          >
            Re-authorize
          </a>
        </div>

        <div className="flex items-center justify-between py-2 opacity-50">
          <div>
            <p className="text-sm font-medium">Garmin Connect</p>
            <p className="text-xs text-gray-400">Coming soon</p>
          </div>
          <span className="px-3 py-1.5 text-xs font-medium text-gray-400 bg-gray-100 rounded-lg">
            Not available
          </span>
        </div>
      </div>

      {/* Save button */}
      <button
        onClick={handleSave}
        disabled={updateSettings.isPending}
        className="w-full bg-brand-600 text-white font-semibold py-4 rounded-xl tap-target text-base active:bg-brand-700 transition-colors"
      >
        {updateSettings.isPending ? "Saving..." : "Save Settings"}
      </button>
    </div>
  );
}
