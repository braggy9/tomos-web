"use client";

import { useEvents } from "../../hooks/useMatters";
import { Spinner, EmptyState } from "@tomos/ui";

const eventIcons: Record<string, string> = {
  status_change: "🔄",
  document_added: "📄",
  task_completed: "✅",
  note_added: "📝",
  meeting: "🤝",
  deadline: "⏰",
};

export function TimelineTab({ matterId }: { matterId: string }) {
  const { data: events, isLoading } = useEvents(matterId);

  if (isLoading) return <Spinner className="py-8" />;

  if (!events || events.length === 0) {
    return <EmptyState title="No activity" description="Events will appear here as the matter progresses" />;
  }

  return (
    <div className="space-y-0">
      {events.map((event, i) => (
        <div key={event.id} className="flex gap-3">
          {/* Timeline line */}
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center text-sm flex-shrink-0">
              {eventIcons[event.type] ?? "📌"}
            </div>
            {i < events.length - 1 && <div className="w-px flex-1 bg-gray-200 my-1" />}
          </div>

          {/* Content */}
          <div className="pb-4 flex-1 min-w-0">
            <p className="text-sm font-medium text-gray-900">{event.title}</p>
            {event.description && (
              <p className="text-xs text-gray-500 mt-0.5">{event.description}</p>
            )}
            <div className="flex items-center gap-2 mt-1">
              <span className="text-xs text-gray-400 capitalize">{event.type.replace(/_/g, " ")}</span>
              {event.actor && <span className="text-xs text-gray-400">· {event.actor}</span>}
              <span className="text-xs text-gray-400">
                · {new Date(event.createdAt).toLocaleString("en-AU", {
                  day: "numeric",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
