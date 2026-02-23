import { get, post, patch, del } from "./client";
import type {
  Matter,
  CreateMatterRequest,
  UpdateMatterRequest,
  MatterDocument,
  CreateDocumentRequest,
  MatterEvent,
  CreateEventRequest,
  MatterNote,
  CreateMatterNoteRequest,
  Pagination,
} from "./types";

// ─── Matters ──────────────────────────────────────

interface ListMattersParams {
  status?: string;
  priority?: string;
  client?: string;
  type?: string;
  limit?: number;
  offset?: number;
}

export async function listMatters(
  params?: ListMattersParams
): Promise<{ success: boolean; data: Matter[]; pagination: Pagination }> {
  return get("/api/matters", params as Record<string, string | number | boolean | undefined>);
}

export async function getMatter(
  id: string
): Promise<{ success: boolean; data: Matter }> {
  return get(`/api/matters/${id}`);
}

export async function createMatter(
  data: CreateMatterRequest
): Promise<{ success: boolean; data: Matter }> {
  return post("/api/matters", data);
}

export async function updateMatter(
  id: string,
  data: UpdateMatterRequest
): Promise<{ success: boolean; data: Matter }> {
  return patch(`/api/matters/${id}`, data);
}

export async function deleteMatter(
  id: string
): Promise<{ success: boolean; data: { id: string; status: string }; message: string }> {
  return del(`/api/matters/${id}`);
}

// ─── Documents ────────────────────────────────────

interface ListDocumentsParams {
  type?: string;
  status?: string;
  limit?: number;
  offset?: number;
}

export async function listDocuments(
  matterId: string,
  params?: ListDocumentsParams
): Promise<{ success: boolean; data: MatterDocument[]; pagination: Pagination }> {
  return get(
    `/api/matters/${matterId}/documents`,
    params as Record<string, string | number | boolean | undefined>
  );
}

export async function createDocument(
  matterId: string,
  data: CreateDocumentRequest
): Promise<{ success: boolean; data: MatterDocument }> {
  return post(`/api/matters/${matterId}/documents`, data);
}

export async function updateDocument(
  matterId: string,
  documentId: string,
  data: Partial<CreateDocumentRequest>
): Promise<{ success: boolean; data: MatterDocument }> {
  return patch(`/api/matters/${matterId}/documents/${documentId}`, data);
}

export async function deleteDocument(
  matterId: string,
  documentId: string
): Promise<{ success: boolean; message: string }> {
  return del(`/api/matters/${matterId}/documents/${documentId}`);
}

// ─── Events ───────────────────────────────────────

interface ListEventsParams {
  type?: string;
  limit?: number;
  offset?: number;
}

export async function listEvents(
  matterId: string,
  params?: ListEventsParams
): Promise<{ success: boolean; data: MatterEvent[]; pagination: Pagination }> {
  return get(
    `/api/matters/${matterId}/events`,
    params as Record<string, string | number | boolean | undefined>
  );
}

export async function createEvent(
  matterId: string,
  data: CreateEventRequest
): Promise<{ success: boolean; data: MatterEvent }> {
  return post(`/api/matters/${matterId}/events`, data);
}

// ─── Matter Notes ─────────────────────────────────

interface ListMatterNotesParams {
  type?: string;
  limit?: number;
  offset?: number;
}

export async function listMatterNotes(
  matterId: string,
  params?: ListMatterNotesParams
): Promise<{ success: boolean; data: MatterNote[]; pagination: Pagination }> {
  return get(
    `/api/matters/${matterId}/notes`,
    params as Record<string, string | number | boolean | undefined>
  );
}

export async function createMatterNote(
  matterId: string,
  data: CreateMatterNoteRequest
): Promise<{ success: boolean; data: MatterNote }> {
  return post(`/api/matters/${matterId}/notes`, data);
}

export async function updateMatterNote(
  matterId: string,
  noteId: string,
  data: Partial<CreateMatterNoteRequest>
): Promise<{ success: boolean; data: MatterNote }> {
  return patch(`/api/matters/${matterId}/notes/${noteId}`, data);
}

export async function deleteMatterNote(
  matterId: string,
  noteId: string
): Promise<{ success: boolean; message: string }> {
  return del(`/api/matters/${matterId}/notes/${noteId}`);
}
