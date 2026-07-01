import { NextResponse } from "next/server";
import {
  fetchCalendarEvents,
  getAccessToken,
  getCalendarConfig,
} from "../../../../lib/googleCalendar";

// Google Calendar API via Service Account (GOOGLE_SERVICE_ACCOUNT env var)
// Tom must share his calendar with the service account email

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  allDay: boolean;
  status: "past" | "current" | "future";
}

export async function GET() {
  const config = getCalendarConfig();
  if (!config.configured) {
    return NextResponse.json({ events: [], configured: false }, { status: 200 });
  }

  let accessToken: string;
  try {
    accessToken = await getAccessToken(config.serviceAccount);
  } catch (err) {
    console.error("Failed to get access token:", err);
    return NextResponse.json({ events: [], configured: true, error: "auth_failed" }, { status: 200 });
  }

  // Calculate Sydney day boundaries using proper offset detection
  const now = new Date();
  // Get Sydney date components
  const sydFmt = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Australia/Sydney",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
  const sydDate = sydFmt.format(now); // "YYYY-MM-DD"
  // Calculate the actual UTC offset for Sydney right now
  const sydneyNow = new Date(
    now.toLocaleString("en-US", { timeZone: "Australia/Sydney" })
  );
  const offsetMs = sydneyNow.getTime() - now.getTime();
  const offsetHours = Math.round(offsetMs / 3600000);
  const offsetStr = `+${String(offsetHours).padStart(2, "0")}:00`;

  const timeMin = `${sydDate}T00:00:00${offsetStr}`;
  const timeMax = `${sydDate}T23:59:59${offsetStr}`;

  try {
    const items = await fetchCalendarEvents({
      accessToken,
      calendarId: config.calendarId,
      timeMin,
      timeMax,
    });
    const events: CalendarEvent[] = items.map(
      (item: {
        id: string;
        summary?: string;
        start?: { dateTime?: string; date?: string };
        end?: { dateTime?: string; date?: string };
        location?: string;
      }) => {
        const allDay = !item.start?.dateTime;
        const startTime = item.start?.dateTime || item.start?.date || "";
        const endTime = item.end?.dateTime || item.end?.date || "";
        const eventStart = new Date(startTime);
        const eventEnd = new Date(endTime);

        let status: "past" | "current" | "future" = "future";
        if (eventEnd < now) status = "past";
        else if (eventStart <= now && eventEnd >= now) status = "current";

        return {
          id: item.id,
          summary: item.summary || "No title",
          start: startTime,
          end: endTime,
          location: item.location || undefined,
          allDay,
          status,
        };
      }
    );

    return NextResponse.json(
      { events, configured: true },
      { headers: { "Cache-Control": "s-maxage=60, stale-while-revalidate=120" } }
    );
  } catch (err) {
    console.error("Calendar fetch error:", err);
    return NextResponse.json({ events: [], configured: true }, { status: 200 });
  }
}
