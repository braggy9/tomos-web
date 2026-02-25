"use client";

import { useState } from "react";
import { useM365Events } from "../hooks/useCalendar";
import type { calendar } from "@tomos/api";
type M365Event = calendar.M365Event;

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-AU", {
    hour: "numeric",
    minute: "2-digit",
    hour12: true,
    timeZone: "Australia/Sydney",
  });
}

function isToday(iso: string): boolean {
  const eventDate = new Date(iso).toLocaleDateString("en-AU", {
    timeZone: "Australia/Sydney",
  });
  const today = new Date().toLocaleDateString("en-AU", {
    timeZone: "Australia/Sydney",
  });
  return eventDate === today;
}

function EventRow({ event }: { event: M365Event }) {
  return (
    <div className="flex items-start gap-3 py-2">
      <div className="flex-shrink-0 w-16 text-xs font-medium text-brand-600 pt-0.5">
        {event.isAllDay ? "All day" : formatTime(event.start)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">{event.subject}</p>
        {event.location && (
          <p className="text-xs text-gray-500 truncate">{event.location}</p>
        )}
      </div>
      {!event.isAllDay && (
        <div className="flex-shrink-0 text-xs text-gray-400 pt-0.5">
          {formatTime(event.end)}
        </div>
      )}
    </div>
  );
}

export function TodaySchedule() {
  const { data, isLoading, error } = useM365Events();
  const [expanded, setExpanded] = useState(true);

  if (isLoading || error) return null;

  const events = data?.events ?? [];
  const todayEvents = events
    .filter((e) => isToday(e.start))
    .sort((a, b) => {
      if (a.isAllDay && !b.isAllDay) return -1;
      if (!a.isAllDay && b.isAllDay) return 1;
      return new Date(a.start).getTime() - new Date(b.start).getTime();
    });

  if (todayEvents.length === 0) return null;

  return (
    <div className="rounded-lg border border-gray-200 bg-white overflow-hidden">
      <button
        onClick={() => setExpanded(!expanded)}
        className="w-full flex items-center justify-between px-4 py-2.5 hover:bg-gray-50 transition-colors"
      >
        <div className="flex items-center gap-2">
          <svg className="w-4 h-4 text-brand-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 0 1 2.25-2.25h13.5A2.25 2.25 0 0 1 21 7.5v11.25m-18 0A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75m-18 0v-7.5A2.25 2.25 0 0 1 5.25 9h13.5A2.25 2.25 0 0 1 21 11.25v7.5" />
          </svg>
          <span className="text-sm font-medium text-gray-700">
            Today&apos;s Schedule
          </span>
          <span className="text-xs text-gray-400">
            {todayEvents.length} event{todayEvents.length !== 1 ? "s" : ""}
          </span>
        </div>
        <svg
          className={`w-4 h-4 text-gray-400 transition-transform ${expanded ? "rotate-180" : ""}`}
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={2}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
        </svg>
      </button>
      {expanded && (
        <div className="px-4 pb-3 divide-y divide-gray-100">
          {todayEvents.map((event) => (
            <EventRow key={event.id} event={event} />
          ))}
        </div>
      )}
    </div>
  );
}
