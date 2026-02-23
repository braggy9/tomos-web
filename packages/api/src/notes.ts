import { get, post, patch, del } from "./client";
import type {
  Note,
  CreateNoteRequest,
  UpdateNoteRequest,
  NoteActionRequest,
  NoteTemplate,
  Pagination,
} from "./types";

interface ListNotesParams {
  limit?: number;
  offset?: number;
  pinned?: boolean;
  taskId?: string;
  matterId?: string;
  projectId?: string;
  tags?: string;
  sortBy?: "createdAt" | "updatedAt" | "title" | "priority";
  sortOrder?: "asc" | "desc";
}

export async function listNotes(
  params?: ListNotesParams
): Promise<{ success: boolean; data: Note[]; pagination: Pagination }> {
  return get("/api/notes", params as Record<string, string | number | boolean | undefined>);
}

export async function getNote(id: string): Promise<{ success: boolean; data: Note }> {
  return get(`/api/notes/${id}`);
}

export async function createNote(
  data: CreateNoteRequest
): Promise<{ success: boolean; data: Note }> {
  return post("/api/notes", data);
}

export async function updateNote(
  id: string,
  data: UpdateNoteRequest
): Promise<{ success: boolean; data: Note }> {
  return patch(`/api/notes/${id}`, data);
}

export async function deleteNote(
  id: string
): Promise<{ success: boolean; message: string }> {
  return del(`/api/notes/${id}`);
}

export async function searchNotes(params: {
  q: string;
  tags?: string;
  limit?: number;
  offset?: number;
}): Promise<{
  success: boolean;
  data: { notes: Note[]; query: string; total: number; hasMore: boolean };
}> {
  return get("/api/notes/search", params as Record<string, string | number | boolean | undefined>);
}

export async function getNoteBacklinks(
  id: string
): Promise<{
  success: boolean;
  data: {
    noteId: string;
    backlinks: Array<{ id: string; title: string; linkContext: string; updatedAt: string }>;
    count: number;
  };
}> {
  return get(`/api/notes/${id}/backlinks`);
}

export async function performNoteAction(
  id: string,
  action: NoteActionRequest
): Promise<{ success: boolean; data: unknown; message?: string }> {
  return post(`/api/notes/${id}/actions`, action);
}

export async function listTemplates(): Promise<{
  success: boolean;
  data: {
    templates: NoteTemplate[];
    categorized: Record<string, NoteTemplate[]>;
  };
}> {
  return get("/api/notes/templates");
}

export async function createFromTemplate(
  templateId: string,
  data: { title?: string; placeholders?: Record<string, string> }
): Promise<{
  success: boolean;
  data: {
    templateId: string;
    templateName: string;
    title: string;
    content: string;
    suggestedTags: string[];
    isPinned: boolean;
  };
}> {
  return post(`/api/notes/templates?id=${templateId}`, data);
}
