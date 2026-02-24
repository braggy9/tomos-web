"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useEntry, useUpdateEntry, useDeleteEntry, useGenerateReflection } from "../../hooks/useJournal";
import { MoodPicker } from "../../components/MoodPicker";
import { Spinner, useToast, MarkdownContent } from "@tomos/ui";
import Link from "next/link";

const moodEmoji: Record<string, string> = {
  great: "\u{1F929}",
  good: "\u{1F60A}",
  okay: "\u{1F610}",
  low: "\u{1F614}",
  rough: "\u{1F62E}\u200D\u{1F4A8}",
};

export default function EntryDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const toast = useToast().toast;

  const { data: entry, isLoading, error } = useEntry(id);
  const updateEntry = useUpdateEntry();
  const deleteEntry = useDeleteEntry();
  const generateReflection = useGenerateReflection();

  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editMood, setEditMood] = useState<string | null>(null);
  const [editEnergy, setEditEnergy] = useState<string | null>(null);

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (error || !entry) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-400 mb-3">Entry not found</p>
        <Link href="/" className="text-sm text-brand-600 hover:text-brand-700">
          &larr; Back to entries
        </Link>
      </div>
    );
  }

  const date = new Date(entry.entryDate);
  const isToday = new Date().toDateString() === date.toDateString();
  const dateLabel = date.toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const startEditing = () => {
    setEditContent(entry.content);
    setEditMood(entry.mood || null);
    setEditEnergy(entry.energy || null);
    setIsEditing(true);
  };

  const saveEdit = async () => {
    try {
      await updateEntry.mutateAsync({
        id,
        data: {
          content: editContent,
          mood: editMood as any,
          energy: editEnergy as any,
        },
      });
      setIsEditing(false);
      toast("Entry updated");
    } catch {
      toast("Failed to save", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entry? This can't be undone.")) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast("Entry deleted");
      router.push("/");
    } catch {
      toast("Failed to delete", "error");
    }
  };

  const handleReflect = async () => {
    try {
      toast("Generating reflection...");
      await generateReflection.mutateAsync(id);
      toast("Reflection added");
    } catch {
      toast("Failed to generate reflection", "error");
    }
  };

  return (
    <div>
      {/* Nav */}
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          &larr; Back
        </Link>
        {!isEditing && (
          <div className="flex gap-1.5">
            <button
              onClick={startEditing}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-gray-500 hover:bg-gray-100 transition-colors"
            >
              Edit
            </button>
            <button
              onClick={handleDelete}
              className="px-2.5 py-1.5 text-xs font-medium rounded-lg text-red-400 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              Delete
            </button>
          </div>
        )}
      </div>

      {/* Entry header */}
      <div className="mb-5">
        <div className="flex items-center gap-2.5 mb-1">
          {entry.mood && (
            <span className="text-2xl">{moodEmoji[entry.mood]}</span>
          )}
          <div>
            <h1 className="text-lg font-bold text-gray-900">
              {isToday ? "Today" : dateLabel}
            </h1>
            <div className="flex items-center gap-2 text-xs text-gray-400">
              <span>{entry.wordCount} words</span>
              {entry.energy && (
                <>
                  <span>&middot;</span>
                  <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-medium ${
                    entry.energy === "high"
                      ? "bg-green-50 text-green-600"
                      : entry.energy === "medium"
                        ? "bg-yellow-50 text-yellow-600"
                        : "bg-red-50 text-red-600"
                  }`}>
                    {entry.energy} energy
                  </span>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing ? (
        <div className="space-y-3">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <MoodPicker
              mood={editMood}
              energy={editEnergy}
              onMoodChange={setEditMood}
              onEnergyChange={setEditEnergy}
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[300px] p-4 text-gray-900 resize-none focus:outline-none text-[15px] leading-relaxed"
              autoFocus
            />
            <div className="border-t border-gray-100 px-4 py-2 text-xs text-gray-400">
              {editContent.split(/\s+/).filter(Boolean).length} words
            </div>
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              disabled={updateEntry.isPending}
              className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40 shadow-sm"
            >
              {updateEntry.isPending ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-xl text-gray-500 text-sm font-medium hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Entry content with markdown rendering */}
          <div className="bg-white rounded-xl border border-gray-200 p-5 mb-4 shadow-sm">
            <MarkdownContent content={entry.content} className="text-[15px] leading-relaxed" />
          </div>

          {/* Themes */}
          {entry.themes.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {entry.themes.map((theme) => (
                <span
                  key={theme}
                  className="text-xs px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 border border-brand-100"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* AI Reflection */}
          {entry.reflection ? (
            <div className="bg-gradient-to-br from-violet-50 to-purple-50 border border-violet-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">Companion's Reflection</span>
              </div>
              <p className="text-sm text-violet-900 leading-relaxed italic">{entry.reflection}</p>
            </div>
          ) : (
            <button
              onClick={handleReflect}
              disabled={generateReflection.isPending}
              className="w-full bg-white border border-dashed border-violet-300 rounded-xl p-3.5 text-sm text-violet-500 hover:bg-violet-50 hover:border-violet-400 transition-all disabled:opacity-40 mb-4 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              {generateReflection.isPending ? "Generating..." : "Ask companion for a reflection"}
            </button>
          )}

          {/* Action: Chat about this */}
          <Link
            href={`/chat?entryId=${entry.id}`}
            className="w-full bg-white border border-gray-200 rounded-xl p-3.5 text-sm text-gray-600 hover:bg-gray-50 hover:border-gray-300 transition-all flex items-center justify-center gap-2 shadow-sm"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
            </svg>
            Chat about this entry
          </Link>
        </>
      )}
    </div>
  );
}
