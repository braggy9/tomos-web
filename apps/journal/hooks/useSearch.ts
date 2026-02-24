"use client";

import { useQuery } from "@tanstack/react-query";
import { journal } from "@tomos/api";

export function useJournalSearch(query: string, mood?: string) {
  return useQuery({
    queryKey: ["journal-search", query, mood],
    queryFn: () => journal.searchEntries({ q: query, mood, limit: 30 }),
    select: (res) => res.data,
    enabled: query.length >= 2,
  });
}
