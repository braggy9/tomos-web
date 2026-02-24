import { get } from "./client";

export interface M365Event {
  id: string;
  subject: string;
  start: string;
  end: string;
  location?: string | null;
  isAllDay: boolean;
  organizer?: string | null;
}

export interface CalendarResponse {
  events: M365Event[];
  syncedAt: string | null;
  source?: string;
  message?: string;
}

export async function getM365Events(): Promise<CalendarResponse> {
  return get<CalendarResponse>("/api/m365-calendar");
}
