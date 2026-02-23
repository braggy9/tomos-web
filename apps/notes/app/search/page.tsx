"use client";

import { useState } from "react";
import { useSearchNotes } from "../../hooks/useNotes";
import { NoteRow } from "../../components/NoteRow";
import { Spinner, EmptyState } from "@tomos/ui";

export default function SearchPage() {
  const [query, setQuery] = useState("");
  const { data, isLoading, error } = useSearchNotes(query);

  return (
    <div className="space-y-4">
      <h1 className="text-xl font-bold text-gray-900">Search Notes</h1>

      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search note content..."
          className="w-full pl-10 pr-3 py-3 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
          autoFocus
        />
      </div>

      {query.length > 0 && query.length < 2 && (
        <p className="text-sm text-gray-400">Type at least 2 characters to search</p>
      )}

      {isLoading && <Spinner className="py-8" />}

      {error && <EmptyState title="Search failed" description={error.message} />}

      {data && (
        <>
          <p className="text-sm text-gray-500">
            {data.total} {data.total === 1 ? "result" : "results"} for &quot;{data.query}&quot;
          </p>

          {data.notes.length > 0 ? (
            <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {data.notes.map((note) => (
                <NoteRow key={note.id} note={note} />
              ))}
            </div>
          ) : (
            <EmptyState title="No results" description="Try different search terms" />
          )}
        </>
      )}

      {!query && (
        <EmptyState
          title="Full-text search"
          description="Search across all note content using PostgreSQL full-text search"
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
          }
        />
      )}
    </div>
  );
}
