"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { matters } from "@tomos/api";
import type {
  Matter,
  MatterStatus,
  MatterPriority,
  MatterType,
  CreateMatterRequest,
  UpdateMatterRequest,
  CreateDocumentRequest,
  CreateEventRequest,
  CreateMatterNoteRequest,
} from "@tomos/api";

const MATTERS_KEY = ["matters"];

export function useMatters(params?: {
  status?: string;
  priority?: string;
  type?: string;
  client?: string;
}) {
  return useQuery({
    queryKey: [...MATTERS_KEY, params],
    queryFn: () => matters.listMatters(params),
    select: (data) => data.data,
  });
}

export function useFilteredMatters(filters: {
  status?: MatterStatus | "all";
  priority?: MatterPriority | "all";
  category?: string | "all";
  search?: string;
}) {
  const query = useMatters();

  const filtered = query.data?.filter((matter) => {
    if (filters.status && filters.status !== "all" && matter.status !== filters.status) return false;
    if (filters.priority && filters.priority !== "all" && matter.priority !== filters.priority) return false;
    if (filters.category && filters.category !== "all" && matter.practiceArea !== filters.category) return false;
    if (filters.search) {
      const q = filters.search.toLowerCase();
      return (
        matter.title.toLowerCase().includes(q) ||
        matter.client.toLowerCase().includes(q) ||
        matter.practiceArea?.toLowerCase().includes(q) ||
        matter.counterparty?.toLowerCase().includes(q) ||
        matter.jurisdiction?.toLowerCase().includes(q) ||
        matter.tags.some((t) => t.toLowerCase().includes(q))
      );
    }
    return true;
  });

  return { ...query, data: filtered };
}

export function useMatter(id: string) {
  return useQuery({
    queryKey: ["matter", id],
    queryFn: () => matters.getMatter(id),
    select: (data) => data.data,
    enabled: !!id,
  });
}

export function useCreateMatter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateMatterRequest) => matters.createMatter(data),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MATTERS_KEY }),
  });
}

export function useUpdateMatter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMatterRequest }) =>
      matters.updateMatter(id, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: MATTERS_KEY });
      queryClient.invalidateQueries({ queryKey: ["matter", variables.id] });
    },
  });
}

export function useDeleteMatter() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => matters.deleteMatter(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: MATTERS_KEY }),
  });
}

// Documents
export function useDocuments(matterId: string) {
  return useQuery({
    queryKey: ["matter-docs", matterId],
    queryFn: () => matters.listDocuments(matterId),
    select: (data) => data.data,
    enabled: !!matterId,
  });
}

export function useCreateDocument() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matterId, data }: { matterId: string; data: CreateDocumentRequest }) =>
      matters.createDocument(matterId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matter-docs", variables.matterId] });
      queryClient.invalidateQueries({ queryKey: ["matter", variables.matterId] });
    },
  });
}

// Events
export function useEvents(matterId: string) {
  return useQuery({
    queryKey: ["matter-events", matterId],
    queryFn: () => matters.listEvents(matterId),
    select: (data) => data.data,
    enabled: !!matterId,
  });
}

export function useCreateEvent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matterId, data }: { matterId: string; data: CreateEventRequest }) =>
      matters.createEvent(matterId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matter-events", variables.matterId] });
      queryClient.invalidateQueries({ queryKey: ["matter", variables.matterId] });
    },
  });
}

// Matter Notes
export function useMatterNotes(matterId: string) {
  return useQuery({
    queryKey: ["matter-notes", matterId],
    queryFn: () => matters.listMatterNotes(matterId),
    select: (data) => data.data,
    enabled: !!matterId,
  });
}

export function useCreateMatterNote() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ matterId, data }: { matterId: string; data: CreateMatterNoteRequest }) =>
      matters.createMatterNote(matterId, data),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["matter-notes", variables.matterId] });
      queryClient.invalidateQueries({ queryKey: ["matter", variables.matterId] });
    },
  });
}
