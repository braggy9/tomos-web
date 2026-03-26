"use client";

import { useCalendar, type CalendarEvent } from "../hooks/useCalendar";
import { Card, SectionHeader, Badge, Skeleton, COLORS } from "./ui";

function formatTime(dateStr: string): string {
  const d = new Date(dateStr);
  return d.toLocaleTimeString("en-AU", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Australia/Sydney",
  });
}

function EventItem({ event }: { event: CalendarEvent }) {
  const opacity = event.status === "past" ? 0.5 : 1;
  const isCurrent = event.status === "current";

  return (
    <div
      style={{
        display: "flex",
        alignItems: "flex-start",
        gap: 10,
        padding: "8px 0",
        borderBottom: `1px solid ${COLORS.border}22`,
        opacity,
      }}
    >
      {isCurrent && (
        <div
          style={{
            width: 3,
            height: 32,
            borderRadius: 2,
            flexShrink: 0,
            backgroundColor: COLORS.active,
          }}
        />
      )}
      {!isCurrent && <div style={{ width: 3, flexShrink: 0 }} />}
      <div style={{ flex: 1, minWidth: 0 }}>
        <div
          style={{
            fontSize: 13,
            color: COLORS.text,
            fontFamily: "var(--font-body)",
            lineHeight: 1.4,
          }}
        >
          {event.summary}
        </div>
        <div style={{ display: "flex", gap: 6, marginTop: 3 }}>
          {event.allDay ? (
            <Badge color={COLORS.upcoming}>All Day</Badge>
          ) : (
            <Badge color={isCurrent ? COLORS.active : COLORS.textMuted}>
              {formatTime(event.start)} – {formatTime(event.end)}
            </Badge>
          )}
          {event.location && (
            <Badge color={COLORS.textDim}>{event.location}</Badge>
          )}
        </div>
      </div>
    </div>
  );
}

export function CalendarPanel() {
  const { data, isLoading, error } = useCalendar();

  const allDayEvents = data?.events.filter((e) => e.allDay) || [];
  const timedEvents = data?.events.filter((e) => !e.allDay) || [];

  return (
    <Card style={{ gridColumn: "1 / -1" }}>
      <SectionHeader
        icon="📅"
        title="Today"
        count={data?.events.length ? `${data.events.length} events` : undefined}
        accent={COLORS.upcoming}
      />
      {isLoading && (
        <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
          <Skeleton width="100%" height={40} />
          <Skeleton width="100%" height={40} />
        </div>
      )}
      {!isLoading && !data?.configured && (
        <div
          style={{
            fontSize: 12,
            color: COLORS.textDim,
            padding: "16px 0",
            textAlign: "center",
            fontFamily: "var(--font-display)",
            textTransform: "uppercase",
            letterSpacing: "0.04em",
          }}
        >
          Google Calendar not configured
        </div>
      )}
      {!isLoading && data?.configured && data.events.length === 0 && (
        <div
          style={{
            fontSize: 13,
            color: COLORS.textMuted,
            padding: "16px 0",
            textAlign: "center",
          }}
        >
          No events today — clear day
        </div>
      )}
      {error && !isLoading && (
        <div style={{ fontSize: 12, color: COLORS.textMuted, padding: "12px 0" }}>
          Could not load calendar
        </div>
      )}
      {allDayEvents.map((e) => (
        <EventItem key={e.id} event={e} />
      ))}
      {timedEvents.map((e) => (
        <EventItem key={e.id} event={e} />
      ))}
    </Card>
  );
}
