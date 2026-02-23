"use client";

import { useEntries } from "../hooks/useJournal";
import { EntryRow } from "../components/EntryRow";
import { Spinner, EmptyState } from "@tomos/ui";
import Link from "next/link";

export default function JournalPage() {
  const { data: entries, isLoading, error } = useEntries();

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-bold text-gray-900">Journal</h1>
        <Link
          href="/new"
          className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Write
        </Link>
      </div>

      {isLoading && (
        <div className="flex justify-center py-12">
          <Spinner size="lg" />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
          Failed to load entries. {error instanceof Error ? error.message : ""}
        </div>
      )}

      {entries && entries.length === 0 && (
        <EmptyState
          title="No journal entries yet"
          description="Start writing to capture your thoughts"
          action={
            <Link
              href="/new"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700"
            >
              Write your first entry
            </Link>
          }
        />
      )}

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
