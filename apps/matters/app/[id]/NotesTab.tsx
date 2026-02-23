"use client";

import { useState } from "react";
import { useMatterNotes, useCreateMatterNote } from "../../hooks/useMatters";
import { Card, Badge, Spinner, EmptyState, Button } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import type { MatterNoteType } from "@tomos/api";

export function NotesTab({ matterId }: { matterId: string }) {
  const { data: notesList, isLoading } = useMatterNotes(matterId);
  const createNote = useCreateMatterNote();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [noteType, setNoteType] = useState<MatterNoteType>("general");

  const handleAdd = () => {
    if (!content.trim()) return;
    createNote.mutate(
      {
        matterId,
        data: {
          title: title.trim() || undefined,
          content: content.trim(),
          type: noteType,
          author: "Tom Bragg",
        },
      },
      {
        onSuccess: () => {
          toast("Note added");
          setShowAdd(false);
          setTitle("");
          setContent("");
        },
        onError: () => toast("Failed to add note", "error"),
      }
    );
  };

  if (isLoading) return <Spinner className="py-8" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Matter Notes</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "Add Note"}
        </Button>
      </div>

      {showAdd && (
        <Card>
          <div className="space-y-3">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Title (optional)..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" autoFocus />
            <select value={noteType} onChange={(e) => setNoteType(e.target.value as MatterNoteType)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:outline-none">
              <option value="general">General</option>
              <option value="decision">Decision</option>
              <option value="analysis">Analysis</option>
              <option value="research">Research</option>
              <option value="meeting_notes">Meeting Notes</option>
            </select>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={6}
              placeholder="Write your note..."
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-y" />
            <Button size="sm" onClick={handleAdd} loading={createNote.isPending} disabled={!content.trim()}>Add Note</Button>
          </div>
        </Card>
      )}

      {notesList && notesList.length === 0 && (
        <EmptyState title="No notes" description="Add research, decisions, or meeting notes" />
      )}

      {notesList?.map((note) => (
        <Card key={note.id}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              {note.title && <h4 className="text-sm font-medium text-gray-900">{note.title}</h4>}
              <div className="flex items-center gap-2 mt-1">
                <Badge value={note.type.replace(/_/g, " ")} />
                {note.author && <span className="text-xs text-gray-400">{note.author}</span>}
                <span className="text-xs text-gray-400">
                  {new Date(note.createdAt).toLocaleDateString("en-AU")}
                </span>
              </div>
            </div>
          </div>
          <pre className="whitespace-pre-wrap text-sm text-gray-600 mt-2 font-sans">{note.content}</pre>
          {note.tags.length > 0 && (
            <div className="flex gap-1 mt-2">
              {note.tags.map((tag) => <Badge key={tag} value={tag} />)}
            </div>
          )}
        </Card>
      ))}
    </div>
  );
}
