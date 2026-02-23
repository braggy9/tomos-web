"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { notes } from "@tomos/api";
import type { Note, NoteStatus, CreateNoteRequest, UpdateNoteRequest, NoteActionRequest } from "@tomos/api";

const NOTES_KEY = ["notes"];

export function useNotes(params?: {
  pinned?: boolean;
  sortBy?: "createdAt" | "updatedAt" | "title" | "priority";
  sortOrder?: "asc" | "desc";
}) {
  return useQuery({
    queryKey: [...NOTES_KEY, params],
    queryFn: () => notes.listNotes(params),
    select: (data) => data.data,
  });
}

export function useFilteredNotes(filters: {
  status?: NoteStatus | "all" | "pinned" | "confidential";
  search?: string;
}) {
  const query = useNotes({ sortBy: "updatedAt", sortOrder: "desc" });

  const filtered = query.data?.filter((note) => {
    if (filters.status && filters.status !== "all") {
      if (filters.status === "pinned" && !note.isPinned) return false;
      if (filters.status === "confidential" && !note.confidential) return false;
      if (["draft", "active", "archived"].includes(filters.status) && note.status !== filters.status) return false;
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        note.title.toLowerCase().includes(q) ||
        note.excerpt?.toLowerCase().includes(q) ||
        note.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return { ...query, data: filtered };
}

export function useNote(id: string) {
  return useQuery({
    queryKey: ["note", id],
    queryFn: () => notes.getNote(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useCreateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateNoteRequest) => notes.createNote(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}

export function useUpdateNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateNoteRequest }) =>
      notes.updateNote(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
      queryClient.invalidateQueries({ queryKey: ["note", variables.id] });
    },
  });
}

export function useDeleteNote() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => notes.deleteNote(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}

export function useNoteAction() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, action }: { id: string; action: NoteActionRequest }) =>
      notes.performNoteAction(id, action),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: NOTES_KEY });
    },
  });
}

export function useSearchNotes(query: string) {
  return useQuery({
    queryKey: ["notes-search", query],
    queryFn: () => notes.searchNotes({ q: query }),
    select: (data) => data.data,
    enabled: query.length >= 2,
  });
}

export function useTemplates() {
  return useQuery({
    queryKey: ["note-templates"],
    queryFn: () => notes.listTemplates(),
    select: (data) => data.data,
    staleTime: 5 * 60 * 1000,
  });
}
