import { NextResponse } from "next/server";
import crypto from "crypto";

// Google Calendar API via Service Account (GOOGLE_SERVICE_ACCOUNT env var)
// Tom must share his calendar with the service account email

interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

interface CalendarEvent {
  id: string;
  summary: string;
  start: string;
  end: string;
  location?: string;
  allDay: boolean;
  status: "past" | "current" | "future";
}

function base64url(data: string | Buffer): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64url");
}

async function getAccessToken(sa: ServiceAccount): Promise<string> {
  const now = Math.floor(Date.now() / 1000);
  const header = base64url(JSON.stringify({ alg: "RS256", typ: "JWT" }));
  const payload = base64url(
    JSON.stringify({
      iss: sa.client_email,
      scope: "https://www.googleapis.com/auth/calendar.readonly",
      aud: sa.token_uri,
      iat: now,
      exp: now + 3600,
    })
  );

  const signInput = `${header}.${payload}`;
  const sign = crypto.createSign("RSA-SHA256");
  sign.update(signInput);
  const signature = sign.sign(sa.private_key, "base64url");

  const jwt = `${signInput}.${signature}`;

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: jwt,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Service account token error:", err);
    throw new Error(`Token exchange failed: ${res.status}`);
  }

  const data = await res.json();
  return data.access_token;
}

export async function GET() {
  const saRaw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!saRaw) {
    return NextResponse.json({ events: [], configured: false }, { status: 200 });
  }

  let sa: ServiceAccount;
  try {
    sa = JSON.parse(saRaw);
  } catch {
    console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT JSON");
    return NextResponse.json({ events: [], configured: false }, { status: 200 });
  }

  const calendarId = (process.env.GOOGLE_CALENDAR_ID || "tom.bragg9@gmail.com").trim();

  let accessToken: string;
  try {
    accessToken = await getAccessToken(sa);
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
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
    );
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("timeZone", "Australia/Sydney");

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Google Calendar API error:", res.status, errText);
      return NextResponse.json(
        { events: [], configured: true, error: `api_${res.status}` },
        { status: 200 }
      );
    }

    const data = await res.json();
    const events: CalendarEvent[] = (data.items || []).map(
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
