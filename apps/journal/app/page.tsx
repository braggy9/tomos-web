"use client";

import { useState } from "react";
import { useEntries } from "../hooks/useJournal";
import { useJournalSearch } from "../hooks/useSearch";
import { EntryRow } from "../components/EntryRow";
import { AppSwitcher } from "../components/AppSwitcher";
import { Spinner, EmptyState } from "@tomos/ui";
import Link from "next/link";

const moodFilters = [
  { value: null, label: "All" },
  { value: "great", label: "\u{1F929}" },
  { value: "good", label: "\u{1F60A}" },
  { value: "okay", label: "\u{1F610}" },
  { value: "low", label: "\u{1F614}" },
  { value: "rough", label: "\u{1F62E}\u200D\u{1F4A8}" },
] as const;

export default function JournalPage() {
  const [search, setSearch] = useState("");
  const [moodFilter, setMoodFilter] = useState<string | null>(null);

  const isSearching = search.length >= 2;
  const entriesQuery = useEntries(moodFilter ? { mood: moodFilter } : undefined);
  const searchQuery = useJournalSearch(search, moodFilter || undefined);

  const entries = isSearching ? searchQuery.data : entriesQuery.data;
  const isLoading = isSearching ? searchQuery.isLoading : entriesQuery.isLoading;
  const error = isSearching ? searchQuery.error : entriesQuery.error;

  const today = new Date();
  const greeting =
    today.getHours() < 12
      ? "Good morning"
      : today.getHours() < 17
        ? "Good afternoon"
        : "Good evening";

  return (
    <div>
      {/* Header */}
      <div className="flex items-start justify-between mb-5">
        <div>
          <p className="text-xs text-gray-400 mb-0.5">{greeting}, Tom</p>
          <h1 className="text-xl font-bold text-gray-900">Journal</h1>
        </div>
        <div className="flex items-center gap-2">
          <AppSwitcher />
          <Link
            href="/new"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Write
          </Link>
        </div>
      </div>

      {/* Search bar */}
      <div className="relative mb-3">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search entries..."
          className="w-full pl-9 pr-4 py-2.5 rounded-xl bg-white border border-gray-200 text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200 transition-colors"
        />
        {search && (
          <button
            onClick={() => setSearch("")}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        )}
      </div>

      {/* Mood filter chips */}
      <div className="flex gap-1.5 mb-4 overflow-x-auto pb-1">
        {moodFilters.map((f) => (
          <button
            key={f.label}
            onClick={() => setMoodFilter(f.value)}
            className={`px-3 py-1 rounded-full text-xs font-medium transition-all whitespace-nowrap ${
              moodFilter === f.value
                ? "bg-brand-100 text-brand-700 border border-brand-200"
                : "bg-white text-gray-500 border border-gray-200 hover:border-gray-300"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-red-700 text-sm">
          Failed to load entries. {error instanceof Error ? error.message : ""}
        </div>
      )}

      {/* Empty state */}
      {entries && entries.length === 0 && !isLoading && (
        <EmptyState
          title={isSearching ? "No results found" : "No journal entries yet"}
          description={
            isSearching
              ? `Nothing matched "${search}"`
              : "Start writing to capture your thoughts"
          }
          action={
            !isSearching ? (
              <Link
                href="/new"
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
              >
                Write your first entry
              </Link>
            ) : undefined
          }
        />
      )}

      {/* Entry list */}
      {entries && entries.length > 0 && (
        <div className="space-y-2">
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </div>
      )}
    </div>
  );
}
