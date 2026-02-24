"use client";

import { use, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useNote, useUpdateNote, useDeleteNote, useNoteAction } from "../../hooks/useNotes";
import { Button, Badge, Spinner, MarkdownContent } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import { SyntaxHelp } from "../../components/SyntaxHelp";
import type { NoteStatus, NotePriority } from "@tomos/api";

export default function NoteDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { data: note, isLoading } = useNote(id);
  const updateNote = useUpdateNote();
  const deleteNote = useDeleteNote();
  const noteAction = useNoteAction();

  const [editing, setEditing] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState<NotePriority>("medium");
  const [status, setStatus] = useState<NoteStatus>("active");

  useEffect(() => {
    if (note) {
      setTitle(note.title);
      setContent(note.content);
      setTags(note.tags.join(", "));
      setPriority(note.priority);
      setStatus(note.status);
    }
  }, [note]);

  if (isLoading) return <Spinner className="py-12" />;
  if (!note) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Note not found</p>
        <Button variant="ghost" onClick={() => router.push("/")} className="mt-2">Back</Button>
      </div>
    );
  }

  const handleSave = () => {
    updateNote.mutate(
      {
        id: note.id,
        data: {
          title: title.trim(),
          content: content.trim(),
          tags: tags.split(",").map((t) => t.trim()).filter(Boolean),
          priority,
          status,
        },
      },
      {
        onSuccess: () => {
          toast("Note updated");
          setEditing(false);
        },
        onError: () => toast("Failed to update note", "error"),
      }
    );
  };

  const handleAction = (action: string) => {
    noteAction.mutate(
      { id: note.id, action: { action: action as "duplicate" | "archive" | "unarchive" | "convert-to-task" } },
      {
        onSuccess: () => {
          toast(`Action "${action}" completed`);
          if (action === "archive" || action === "convert-to-task") router.push("/");
        },
        onError: () => toast(`Failed to ${action}`, "error"),
      }
    );
  };

  const handleDelete = () => {
    if (!confirm("Delete this note?")) return;
    deleteNote.mutate(note.id, {
      onSuccess: () => {
        toast("Note deleted");
        router.push("/");
      },
      onError: () => toast("Failed to delete note", "error"),
    });
  };

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/")} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-lg font-bold text-gray-900 flex-1 truncate">{note.title}</h1>
        <Button variant="ghost" size="sm" onClick={() => setEditing(!editing)}>
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>

      {/* Meta */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="status" value={note.status} />
        <Badge variant="priority" value={note.priority} />
        {note.isPinned && <Badge value="pinned" />}
        {note.confidential && <Badge value="confidential" />}
        {note.tags.map((tag) => <Badge key={tag} value={tag} />)}
      </div>

      {editing ? (
        /* Edit Mode */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content</label>
            <textarea value={content} onChange={(e) => setContent(e.target.value)} rows={16}
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-y" />
            <div className="mt-1">
              <SyntaxHelp />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags</label>
            <input type="text" value={tags} onChange={(e) => setTags(e.target.value)} placeholder="comma-separated"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as NotePriority)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none">
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as NoteStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none">
                <option value="active">Active</option>
                <option value="draft">Draft</option>
                <option value="archived">Archived</option>
              </select>
            </div>
          </div>
          <Button onClick={handleSave} loading={updateNote.isPending} className="w-full">Save</Button>
        </div>
      ) : (
        /* View Mode */
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <MarkdownContent content={note.content} />
        </div>
      )}

      {/* Links */}
      {note.links && (note.links.tasks.length > 0 || note.links.matters.length > 0 || note.links.projects.length > 0 || note.links.notes.length > 0) && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-2">
          <h3 className="text-sm font-medium text-gray-700">Linked Items</h3>
          {note.links.tasks.length > 0 && (
            <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
              <span className="font-medium">Tasks:</span>
              {note.links.tasks.map((t, i) => (
                <span key={t.id}>
                  <a href={`https://tomos-tasks.vercel.app/${t.id}`} target="_blank" rel="noopener noreferrer"
                    className="text-violet-600 hover:text-violet-700 underline underline-offset-2">{t.title}</a>
                  {i < note.links!.tasks.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}
          {note.links.matters.length > 0 && (
            <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
              <span className="font-medium">Matters:</span>
              {note.links.matters.map((m, i) => (
                <span key={m.id}>
                  <a href={`https://tomos-matters.vercel.app/${m.id}`} target="_blank" rel="noopener noreferrer"
                    className="text-violet-600 hover:text-violet-700 underline underline-offset-2">{m.title}</a>
                  {i < note.links!.matters.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}
          {note.links.projects.length > 0 && (
            <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
              <span className="font-medium">Projects:</span>
              {note.links.projects.map((p, i) => (
                <span key={p.id}>
                  <span className="text-gray-600">{p.title}</span>
                  {i < note.links!.projects.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}
          {note.links.notes.length > 0 && (
            <div className="text-xs text-gray-500 flex items-center gap-1 flex-wrap">
              <span className="font-medium">Notes:</span>
              {note.links.notes.map((n, i) => (
                <span key={n.id}>
                  <a href={`/${n.id}`}
                    className="text-violet-600 hover:text-violet-700 underline underline-offset-2">{n.title}</a>
                  {i < note.links!.notes.length - 1 && ", "}
                </span>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Actions */}
      {!editing && (
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" size="sm" onClick={() => handleAction("duplicate")}>Duplicate</Button>
          <Button variant="secondary" size="sm" onClick={() => handleAction("convert-to-task")}>Convert to Task</Button>
          {note.status !== "archived" ? (
            <Button variant="secondary" size="sm" onClick={() => handleAction("archive")}>Archive</Button>
          ) : (
            <Button variant="secondary" size="sm" onClick={() => handleAction("unarchive")}>Unarchive</Button>
          )}
          <Button variant="destructive" size="sm" onClick={handleDelete}>Delete</Button>
        </div>
      )}

      {/* Meta footer */}
      <div className="text-xs text-gray-400 space-y-0.5">
        <p>Created: {new Date(note.createdAt).toLocaleString("en-AU")}</p>
        <p>Updated: {new Date(note.updatedAt).toLocaleString("en-AU")}</p>
      </div>
    </div>
  );
}
