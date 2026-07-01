import crypto from "crypto";

export interface ServiceAccount {
  client_email: string;
  private_key: string;
  token_uri: string;
}

export interface GoogleCalendarEvent {
  id: string;
  summary?: string;
  description?: string;
  location?: string;
  colorId?: string;
  htmlLink?: string;
  transparency?: string;
  recurringEventId?: string;
  start?: { dateTime?: string; date?: string };
  end?: { dateTime?: string; date?: string };
}

function base64url(data: string | Buffer): string {
  const buf = typeof data === "string" ? Buffer.from(data) : data;
  return buf.toString("base64url");
}

export function getCalendarConfig():
  | { configured: false; error?: "missing_service_account" | "invalid_service_account" }
  | { configured: true; serviceAccount: ServiceAccount; calendarId: string } {
  const saRaw = process.env.GOOGLE_SERVICE_ACCOUNT;
  if (!saRaw) return { configured: false, error: "missing_service_account" };

  try {
    const serviceAccount = JSON.parse(saRaw) as ServiceAccount;
    return {
      configured: true,
      serviceAccount,
      calendarId: (process.env.GOOGLE_CALENDAR_ID || "tom.bragg9@gmail.com").trim(),
    };
  } catch {
    console.error("Failed to parse GOOGLE_SERVICE_ACCOUNT JSON");
    return { configured: false, error: "invalid_service_account" };
  }
}

export async function getAccessToken(sa: ServiceAccount): Promise<string> {
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

  const res = await fetch(sa.token_uri, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "urn:ietf:params:oauth:grant-type:jwt-bearer",
      assertion: `${signInput}.${signature}`,
    }),
  });

  if (!res.ok) {
    const err = await res.text();
    console.error("Service account token error:", err);
    throw new Error(`Token exchange failed: ${res.status}`);
  }

  const data = (await res.json()) as { access_token: string };
  return data.access_token;
}

export async function fetchCalendarEvents({
  accessToken,
  calendarId,
  timeMin,
  timeMax,
  maxResults = 250,
}: {
  accessToken: string;
  calendarId: string;
  timeMin: string;
  timeMax: string;
  maxResults?: number;
}): Promise<GoogleCalendarEvent[]> {
  const events: GoogleCalendarEvent[] = [];
  let pageToken: string | undefined;

  do {
    const url = new URL(
      `https://www.googleapis.com/calendar/v3/calendars/${encodeURIComponent(calendarId)}/events`
    );
    url.searchParams.set("timeMin", timeMin);
    url.searchParams.set("timeMax", timeMax);
    url.searchParams.set("singleEvents", "true");
    url.searchParams.set("orderBy", "startTime");
    url.searchParams.set("timeZone", "Australia/Sydney");
    url.searchParams.set("maxResults", String(maxResults));
    if (pageToken) url.searchParams.set("pageToken", pageToken);

    const res = await fetch(url.toString(), {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const errText = await res.text();
      console.error("Google Calendar API error:", res.status, errText);
      throw new Error(`Calendar API failed: ${res.status}`);
    }

    const data = (await res.json()) as {
      items?: GoogleCalendarEvent[];
      nextPageToken?: string;
    };
    events.push(...(data.items || []));
    pageToken = data.nextPageToken;
  } while (pageToken);

  return events;
}
