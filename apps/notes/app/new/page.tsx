"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import { useCreateNote, useTemplates } from "../../hooks/useNotes";
import type { NoteStatus, NotePriority } from "@tomos/api";

export default function NewNotePage() {
  const router = useRouter();
  const { toast } = useToast();
  const createNote = useCreateNote();
  const { data: templateData } = useTemplates();

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [tags, setTags] = useState("");
  const [priority, setPriority] = useState<NotePriority>("medium");
  const [status, setStatus] = useState<NoteStatus>("active");
  const [confidential, setConfidential] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    createNote.mutate(
      {
        title: title.trim(),
        content: content.trim(),
        tags: tags
          .split(",")
          .map((t) => t.trim())
          .filter(Boolean),
        priority,
        status,
        confidential,
      },
      {
        onSuccess: () => {
          toast("Note created");
          router.push("/");
        },
        onError: () => toast("Failed to create note", "error"),
      }
    );
  };

  const handleTemplate = (templateId: string, templateName: string, templateContent: string) => {
    setTitle(templateName);
    setContent(templateContent);
    setShowTemplates(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.push("/")}
          className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
        >
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900 flex-1">New Note</h1>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowTemplates(!showTemplates)}
        >
          Templates
        </Button>
      </div>

      {/* Template Picker */}
      {showTemplates && templateData && (
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4">
          <h3 className="text-sm font-medium text-gray-700 mb-3">Choose a template</h3>
          <div className="grid grid-cols-2 gap-2">
            {templateData.templates.map((tmpl) => (
              <button
                key={tmpl.id}
                onClick={() => handleTemplate(tmpl.id, tmpl.name, "")}
                className="text-left p-3 rounded-lg border border-gray-200 hover:border-brand-300 hover:bg-brand-50 transition-colors"
              >
                <span className="text-lg">{tmpl.icon}</span>
                <p className="text-sm font-medium text-gray-900 mt-1">{tmpl.name}</p>
                <p className="text-xs text-gray-500">{tmpl.category}</p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Note Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Note title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Content (Markdown)</label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              rows={12}
              placeholder="Write your note in Markdown..."
              className="w-full px-3 py-2 text-sm font-mono border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-y"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
            <input
              type="text"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="meeting, legal, important"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select
                value={priority}
                onChange={(e) => setPriority(e.target.value as NotePriority)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              >
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as NoteStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              >
                <option value="active">Active</option>
                <option value="draft">Draft</option>
              </select>
            </div>
          </div>

          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={confidential}
              onChange={(e) => setConfidential(e.target.checked)}
              className="rounded border-gray-300 text-brand-600 focus:ring-brand-500"
            />
            <span className="text-sm text-gray-700">Confidential</span>
          </label>
        </div>

        <Button type="submit" loading={createNote.isPending} disabled={!title.trim()} className="w-full">
          Create Note
        </Button>
      </form>
    </div>
  );
}
