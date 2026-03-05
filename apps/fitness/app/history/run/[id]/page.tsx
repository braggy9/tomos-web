"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useRunningActivity, useActivityStreams } from "../../../../hooks/useRunning";
import { Spinner } from "@tomos/ui";

const ZONE_COLORS = [
  "bg-gray-300",
  "bg-blue-400",
  "bg-green-500",
  "bg-yellow-500",
  "bg-red-500",
];

function formatPace(minPerKm: number | null): string {
  if (!minPerKm || minPerKm <= 0) return "—";
  const mins = Math.floor(minPerKm);
  const secs = Math.round((minPerKm - mins) * 60);
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return h > 0 ? `${h}h ${m}m` : `${m}m`;
}

export default function RunDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { data: activity, isLoading } = useRunningActivity(id);
  const [loadStreams, setLoadStreams] = useState(false);
  const { data: streams, isLoading: streamsLoading } = useActivityStreams(
    id,
    loadStreams
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  if (!activity) {
    return (
      <div className="py-8 text-center text-gray-400">Activity not found</div>
    );
  }

  const date = new Date(activity.date);
  const dateStr = date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Sydney",
  });

  return (
    <div className="space-y-4">
      {/* Back button + header */}
      <div>
        <button
          onClick={() => router.back()}
          className="text-sm text-brand-600 font-medium mb-2"
        >
          &larr; Back
        </button>
        <h1 className="text-xl font-bold">
          {activity.activityName || "Run"}
        </h1>
        <p className="text-sm text-gray-500">{dateStr}</p>
        <span className="inline-block mt-1 px-2 py-0.5 text-xs font-medium rounded-full bg-brand-50 text-brand-700 capitalize">
          {activity.runSession?.sessionTypeOverride || activity.type}
        </span>
      </div>

      {/* Stats grid */}
      <div className="bg-white rounded-xl border border-gray-200 p-4">
        <div className="grid grid-cols-3 gap-3">
          <Stat label="Distance" value={`${activity.distance.toFixed(1)} km`} />
          <Stat label="Duration" value={formatDuration(activity.duration)} />
          <Stat label="Avg Pace" value={`${formatPace(activity.avgPace)} /km`} />
          <Stat
            label="Avg HR"
            value={activity.avgHeartRate ? `${activity.avgHeartRate} bpm` : "—"}
          />
          <Stat
            label="Max HR"
            value={activity.maxHeartRate ? `${activity.maxHeartRate} bpm` : "—"}
          />
          <Stat
            label="Elevation"
            value={
              activity.elevationGain
                ? `${Math.round(activity.elevationGain)}m`
                : "—"
            }
          />
          {activity.avgCadence && (
            <Stat label="Cadence" value={`${Math.round(activity.avgCadence)} spm`} />
          )}
          {activity.calories && (
            <Stat label="Calories" value={`${activity.calories} kcal`} />
          )}
          {activity.runSession?.rpe && (
            <Stat label="RPE" value={String(activity.runSession.rpe)} />
          )}
        </div>
      </div>

      {/* Splits table */}
      {activity.splits && activity.splits.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-4 py-2 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-700">Splits</h2>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="text-[10px] uppercase text-gray-400 font-medium">
                <th className="px-4 py-1.5 text-left">Km</th>
                <th className="px-2 py-1.5 text-left">Pace</th>
                <th className="px-2 py-1.5 text-right">HR</th>
                <th className="px-4 py-1.5 text-right">Elev</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {activity.splits.map((split) => (
                <tr key={split.km}>
                  <td className="px-4 py-1.5 font-mono text-xs text-gray-400">
                    {split.km}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-xs">
                    {formatPace(split.avgPace)}
                  </td>
                  <td className="px-2 py-1.5 font-mono text-xs text-right text-gray-500">
                    {split.avgHR || "—"}
                  </td>
                  <td className="px-4 py-1.5 font-mono text-xs text-right text-gray-400">
                    {split.elevation > 0
                      ? `+${Math.round(split.elevation)}m`
                      : split.elevation < 0
                        ? `${Math.round(split.elevation)}m`
                        : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* HR zone distribution */}
      {activity.zoneTime?.some((z) => z.percentage > 0) ? (
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <h2 className="text-sm font-semibold text-gray-700 mb-2">
              HR Zones
            </h2>
            <div className="flex rounded-lg overflow-hidden h-6">
              {activity.zoneTime.map((z, i) =>
                z.percentage > 0 ? (
                  <div
                    key={z.zone}
                    className={`${ZONE_COLORS[i]} flex items-center justify-center`}
                    style={{ width: `${z.percentage}%` }}
                  >
                    {z.percentage >= 10 && (
                      <span className="text-[10px] font-bold text-white">
                        Z{z.zone}
                      </span>
                    )}
                  </div>
                ) : null
              )}
            </div>
            <div className="grid grid-cols-5 gap-1 mt-3">
              {activity.zoneTime.map((z, i) => (
                <div key={z.zone} className="text-center">
                  <span
                    className={`inline-block w-3 h-3 rounded-full ${ZONE_COLORS[i]} mb-0.5`}
                  />
                  <p className="text-[10px] font-medium text-gray-600">
                    Z{z.zone}
                  </p>
                  <p className="text-xs text-gray-400">
                    {z.minutes > 0 ? `${z.minutes.toFixed(0)}m` : "—"}
                  </p>
                  <p className="text-[10px] text-gray-300">{z.percentage}%</p>
                </div>
              ))}
            </div>
          </div>
        ) : null}

      {/* Session notes */}
      {(activity.runSession?.notes || activity.description) && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">Notes</h2>
          <p className="text-sm text-gray-600">
            {activity.runSession?.notes || activity.description}
          </p>
        </div>
      )}

      {/* Load streams button */}
      {!streams && (
        <button
          onClick={() => setLoadStreams(true)}
          disabled={streamsLoading}
          className="w-full py-3 text-sm font-medium text-brand-600 bg-brand-50 rounded-xl transition-colors hover:bg-brand-100"
        >
          {streamsLoading ? "Loading streams..." : "Load Detailed Streams"}
        </button>
      )}

      {streams && (
        <div className="bg-white rounded-xl border border-gray-200 p-4">
          <h2 className="text-sm font-semibold text-gray-700 mb-1">
            Streams Data
          </h2>
          <p className="text-xs text-gray-400">
            Detailed HR, distance, and altitude data loaded
          </p>
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase text-gray-400 font-medium">
        {label}
      </p>
      <p className="text-sm font-semibold">{value}</p>
    </div>
  );
}
