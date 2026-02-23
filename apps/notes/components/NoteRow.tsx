"use client";

import Link from "next/link";
import type { Note } from "@tomos/api";
import { Badge } from "@tomos/ui";

interface NoteRowProps {
  note: Note;
}

export function NoteRow({ note }: NoteRowProps) {
  return (
    <Link
      href={`/${note.id}`}
      className="block px-4 py-3 bg-white border-b border-gray-100 hover:bg-gray-50 transition-colors active:bg-gray-100"
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            {note.isPinned && (
              <svg className="w-3.5 h-3.5 text-amber-500 flex-shrink-0" fill="currentColor" viewBox="0 0 24 24">
                <path d="M16 12V4h1V2H7v2h1v8l-2 2v2h5.2v6h1.6v-6H18v-2l-2-2z" />
              </svg>
            )}
            {note.confidential && (
              <svg className="w-3.5 h-3.5 text-red-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 10-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 002.25-2.25v-6.75a2.25 2.25 0 00-2.25-2.25H6.75a2.25 2.25 0 00-2.25 2.25v6.75a2.25 2.25 0 002.25 2.25z" />
              </svg>
            )}
            <span className="text-sm font-medium text-gray-900 truncate">
              {note.title}
            </span>
          </div>
          {note.excerpt && (
            <p className="text-xs text-gray-500 mt-0.5 line-clamp-1">
              {note.excerpt}
            </p>
          )}
          <div className="flex items-center gap-2 mt-1.5 flex-wrap">
            <Badge variant="status" value={note.status} />
            <Badge variant="priority" value={note.priority} />
            {note.tags.slice(0, 3).map((tag) => (
              <Badge key={tag} value={tag} />
            ))}
          </div>
        </div>
        <span className="text-xs text-gray-400 flex-shrink-0">
          {new Date(note.updatedAt).toLocaleDateString("en-AU", {
            day: "numeric",
            month: "short",
          })}
        </span>
      </div>
    </Link>
  );
}
