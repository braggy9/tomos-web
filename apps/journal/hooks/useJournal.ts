"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { journal } from "@tomos/api";
import type {
  JournalEntry,
  CreateJournalEntryRequest,
  UpdateJournalEntryRequest,
} from "@tomos/api";

export function useEntries(params?: { mood?: string; from?: string; to?: string }) {
  return useQuery({
    queryKey: ["journal-entries", params],
    queryFn: () => journal.getEntries({ limit: 50, ...params }),
    select: (res) => res.data,
  });
}

export function useEntry(id: string) {
  return useQuery({
    queryKey: ["journal-entry", id],
    queryFn: () => journal.getEntry(id),
    select: (res) => res.data,
    enabled: !!id,
  });
}

export function useCreateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateJournalEntryRequest) => journal.createEntry(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });
}

export function useUpdateEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateJournalEntryRequest }) =>
      journal.updateEntry(id, data),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
      queryClient.invalidateQueries({ queryKey: ["journal-entry", variables.id] });
    },
  });
}

export function useDeleteEntry() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => journal.deleteEntry(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });
}

export function useGenerateReflection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (entryId: string) => journal.generateReflection(entryId),
    onSuccess: (_, entryId) => {
      queryClient.invalidateQueries({ queryKey: ["journal-entry", entryId] });
      queryClient.invalidateQueries({ queryKey: ["journal-entries"] });
    },
  });
}
