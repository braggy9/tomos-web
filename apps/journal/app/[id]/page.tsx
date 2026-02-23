"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useEntry, useUpdateEntry, useDeleteEntry, useGenerateReflection } from "../../hooks/useJournal";
import { MoodPicker } from "../../components/MoodPicker";
import { Spinner, useToast } from "@tomos/ui";
import Link from "next/link";

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
      <div className="bg-red-50 border border-red-200 rounded-lg p-4 text-red-700 text-sm">
        Entry not found.{" "}
        <Link href="/" className="underline">
          Back to entries
        </Link>
      </div>
    );
  }

  const moodEmoji: Record<string, string> = {
    great: "\u{1F929}",
    good: "\u{1F60A}",
    okay: "\u{1F610}",
    low: "\u{1F614}",
    rough: "\u{1F62E}\u200D\u{1F4A8}",
  };

  const date = new Date(entry.entryDate);
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
    } catch (err) {
      toast("Failed to save", "error");
    }
  };

  const handleDelete = async () => {
    if (!confirm("Delete this entry? This can't be undone.")) return;
    try {
      await deleteEntry.mutateAsync(id);
      toast("Entry deleted");
      router.push("/");
    } catch (err) {
      toast("Failed to delete", "error");
    }
  };

  const handleReflect = async () => {
    try {
      toast("Generating reflection...");
      await generateReflection.mutateAsync(id);
      toast("Reflection added");
    } catch (err) {
      toast("Failed to generate reflection", "error");
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <Link href="/" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Back
        </Link>
        <div className="flex gap-2">
          {!isEditing && (
            <>
              <button
                onClick={startEditing}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-gray-200 text-gray-600 hover:bg-gray-50"
              >
                Edit
              </button>
              <button
                onClick={handleDelete}
                className="px-3 py-1.5 text-xs font-medium rounded-lg border border-red-200 text-red-600 hover:bg-red-50"
              >
                Delete
              </button>
            </>
          )}
        </div>
      </div>

      {/* Header */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-1">
          <h1 className="text-lg font-bold text-gray-900">
            {entry.title || dateLabel}
          </h1>
          {entry.mood && (
            <span className="text-xl">{moodEmoji[entry.mood] || entry.mood}</span>
          )}
        </div>
        <p className="text-sm text-gray-500">{dateLabel} &middot; {entry.wordCount} words</p>
      </div>

      {isEditing ? (
        <div className="space-y-4">
          <div className="bg-white rounded-xl border border-gray-200 p-4">
            <MoodPicker
              mood={editMood}
              energy={editEnergy}
              onMoodChange={setEditMood}
              onEnergyChange={setEditEnergy}
            />
          </div>
          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full min-h-[300px] p-4 text-gray-900 resize-none focus:outline-none text-[15px] leading-relaxed"
            />
          </div>
          <div className="flex gap-2">
            <button
              onClick={saveEdit}
              disabled={updateEntry.isPending}
              className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              {updateEntry.isPending ? "Saving..." : "Save"}
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="px-4 py-2 rounded-lg border border-gray-200 text-gray-600 text-sm font-medium hover:bg-gray-50"
            >
              Cancel
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Entry content */}
          <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="prose prose-sm max-w-none text-gray-800 whitespace-pre-wrap leading-relaxed">
              {entry.content}
            </div>
          </div>

          {/* Themes */}
          {entry.themes.length > 0 && (
            <div className="flex gap-1.5 flex-wrap mb-4">
              {entry.themes.map((theme) => (
                <span
                  key={theme}
                  className="text-xs px-2 py-0.5 rounded-full bg-brand-50 text-brand-600 border border-brand-100"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}

          {/* AI Reflection */}
          {entry.reflection ? (
            <div className="bg-violet-50 border border-violet-200 rounded-xl p-4 mb-4">
              <div className="flex items-center gap-1.5 mb-2">
                <svg className="w-4 h-4 text-violet-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
                </svg>
                <span className="text-xs font-medium text-violet-600 uppercase tracking-wider">Reflection</span>
              </div>
              <p className="text-sm text-violet-900 leading-relaxed">{entry.reflection}</p>
            </div>
          ) : (
            <button
              onClick={handleReflect}
              disabled={generateReflection.isPending}
              className="w-full bg-white border border-violet-200 rounded-xl p-3 text-sm text-violet-600 hover:bg-violet-50 transition-colors disabled:opacity-50 mb-4 flex items-center justify-center gap-2"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              {generateReflection.isPending ? "Generating reflection..." : "Generate AI reflection"}
            </button>
          )}

          {/* Chat about this entry */}
          <Link
            href={`/chat?entryId=${entry.id}`}
            className="w-full bg-white border border-gray-200 rounded-xl p-3 text-sm text-gray-600 hover:bg-gray-50 transition-colors flex items-center justify-center gap-2"
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
