"use client";

import { useSessions } from "../../hooks/useFitness";
import { SessionCard } from "../../components/SessionCard";
import { AppSwitcher } from "../../components/AppSwitcher";
import { Spinner, EmptyState } from "@tomos/ui";

export default function HistoryPage() {
  const { data: sessions, isLoading, error } = useSessions(50);

  return (
    <div>
      <div className="flex items-start justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Session History</h1>
        <AppSwitcher />
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Failed to load sessions. {error instanceof Error ? error.message : ""}
        </div>
      )}

      {sessions && sessions.length === 0 && !isLoading && (
        <EmptyState
          title="No sessions yet"
          description="Log your first workout to see it here"
        />
      )}

      {sessions && sessions.length > 0 && (
        <div className="space-y-2">
          {sessions.map((session) => (
            <SessionCard key={session.id} session={session} />
          ))}
        </div>
      )}
    </div>
  );
}
