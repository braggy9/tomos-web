import { get, post, patch, del } from "./client";
import type {
  JournalEntry,
  JournalConversation,
  JournalMessage,
  JournalInsights,
  JournalSummary,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
  Pagination,
} from "./types";

// ─── Entries ─────────────────────────────────────

export async function getEntries(params?: {
  limit?: number;
  offset?: number;
  mood?: string;
  from?: string;
  to?: string;
}): Promise<{ success: boolean; data: JournalEntry[]; pagination: Pagination }> {
  return get("/api/journal/entries", params);
}

export async function getEntry(id: string): Promise<{ success: boolean; data: JournalEntry }> {
  return get(`/api/journal/entries/${id}`);
}

export async function createEntry(
  data: CreateJournalEntryRequest
): Promise<{ success: boolean; data: JournalEntry }> {
  return post("/api/journal/entries", data);
}

export async function updateEntry(
  id: string,
  data: UpdateJournalEntryRequest
): Promise<{ success: boolean; data: JournalEntry }> {
  return patch(`/api/journal/entries/${id}`, data);
}

export async function deleteEntry(
  id: string
): Promise<{ success: boolean; message: string }> {
  return del(`/api/journal/entries/${id}`);
}

// ─── AI Reflection ───────────────────────────────

export async function generateReflection(
  entryId: string
): Promise<{ success: boolean; data: { reflection: string; entry: JournalEntry } }> {
  return post(`/api/journal/entries/${entryId}/reflect`);
}

// ─── Chat / Companion ────────────────────────────

export async function sendMessage(data: {
  message: string;
  conversationId?: string;
  entryId?: string;
  mode?: string;
}): Promise<{ success: boolean; data: { conversationId: string; message: JournalMessage } }> {
  return post("/api/journal/chat", data);
}

export async function getConversations(): Promise<{
  success: boolean;
  data: JournalConversation[];
}> {
  return get("/api/journal/chat");
}

export async function getConversation(conversationId: string): Promise<{
  success: boolean;
  data: JournalConversation;
}> {
  return get("/api/journal/chat", { conversationId });
}

// ─── Insights ────────────────────────────────────

export async function getInsights(days?: number): Promise<{
  success: boolean;
  data: JournalInsights;
}> {
  return get("/api/journal/insights", days ? { days } : undefined);
}

// ─── Summaries ───────────────────────────────────

export async function getSummaries(type?: string): Promise<{
  success: boolean;
  data: JournalSummary[];
}> {
  return get("/api/journal/summary", type ? { type } : undefined);
}

export async function generateSummary(type?: string): Promise<{
  success: boolean;
  data: JournalSummary;
}> {
  return post("/api/journal/summary", { type: type ?? "weekly" });
}
