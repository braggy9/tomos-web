"use client";

import { useState } from "react";
import Link from "next/link";
import type { NoteStatus } from "@tomos/api";
import { useFilteredNotes } from "../hooks/useNotes";
import { NoteFilters } from "../components/NoteFilters";
import { NoteRow } from "../components/NoteRow";
import { Spinner, EmptyState, Button } from "@tomos/ui";

type FilterValue = NoteStatus | "all" | "pinned" | "confidential";

export default function NotesPage() {
  const [status, setStatus] = useState<FilterValue>("all");
  const [search, setSearch] = useState("");

  const { data: notesList, isLoading, error } = useFilteredNotes({ status, search });

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold text-gray-900">Notes</h1>
        <Link href="/new">
          <Button size="sm">New Note</Button>
        </Link>
      </div>

      <NoteFilters
        status={status}
        search={search}
        onStatusChange={setStatus}
        onSearchChange={setSearch}
      />

      {isLoading && <Spinner className="py-12" />}

      {error && (
        <EmptyState title="Failed to load notes" description={error.message} />
      )}

      {notesList && notesList.length === 0 && (
        <EmptyState
          title="No notes found"
          description="Create a note to get started"
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
            </svg>
          }
          action={
            <Link href="/new">
              <Button>Create Note</Button>
            </Link>
          }
        />
      )}

      {notesList && notesList.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
          {notesList.map((note) => (
            <NoteRow key={note.id} note={note} />
          ))}
        </div>
      )}
    </div>
  );
}
