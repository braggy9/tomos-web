"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useCreateEntry } from "../../hooks/useJournal";
import { MoodPicker } from "../../components/MoodPicker";
import { useToast } from "@tomos/ui";
import Link from "next/link";

const DRAFT_KEY = "tomos-journal-draft";

interface Draft {
  content: string;
  mood: string | null;
  energy: string | null;
  savedAt: number;
}

export default function NewEntryPage() {
  const router = useRouter();
  const toast = useToast().toast;
  const createEntry = useCreateEntry();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<string | null>(null);
  const [hasDraft, setHasDraft] = useState(false);

  // Restore draft on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(DRAFT_KEY);
      if (saved) {
        const draft: Draft = JSON.parse(saved);
        // Only restore if less than 24 hours old
        if (Date.now() - draft.savedAt < 24 * 60 * 60 * 1000) {
          setContent(draft.content);
          setMood(draft.mood);
          setEnergy(draft.energy);
          setHasDraft(true);
        } else {
          localStorage.removeItem(DRAFT_KEY);
        }
      }
    } catch {}
  }, []);

  // Auto-save draft every 2 seconds when content changes
  const saveDraft = useCallback(() => {
    if (content.trim()) {
      const draft: Draft = { content, mood, energy, savedAt: Date.now() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [content, mood, energy]);

  useEffect(() => {
    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [saveDraft]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const result = await createEntry.mutateAsync({
        content: content.trim(),
        mood: mood as any,
        energy: energy as any,
      });
      clearDraft();
      toast("Entry saved");
      router.push(`/${result.data.id}`);
    } catch (err) {
      toast("Failed to save", "error");
    }
  };

  const handleDiscard = () => {
    if (content.trim() && !confirm("Discard this entry?")) return;
    clearDraft();
    setContent("");
    setMood(null);
    setEnergy(null);
    router.push("/");
  };

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    timeZone: "Australia/Sydney",
  });

  const wordCount = content.split(/\s+/).filter(Boolean).length;

  return (
    <form onSubmit={handleSubmit}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleDiscard}
              className="text-sm text-gray-400 hover:text-gray-600"
            >
              &larr;
            </button>
            <h1 className="text-lg font-bold text-gray-900">New Entry</h1>
          </div>
          <p className="text-xs text-gray-400 ml-6">{today}</p>
        </div>
        <button
          type="submit"
          disabled={!content.trim() || createEntry.isPending}
          className="px-4 py-2 rounded-xl bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shadow-sm"
        >
          {createEntry.isPending ? "Saving..." : "Save"}
        </button>
      </div>

      {/* Draft restored banner */}
      {hasDraft && (
        <div className="bg-amber-50 border border-amber-200 rounded-xl px-3 py-2 mb-3 flex items-center justify-between">
          <span className="text-xs text-amber-700">Draft restored</span>
          <button
            type="button"
            onClick={() => {
              clearDraft();
              setContent("");
              setMood(null);
              setEnergy(null);
              setHasDraft(false);
            }}
            className="text-xs text-amber-500 hover:text-amber-700"
          >
            Clear
          </button>
        </div>
      )}

      {/* Mood / Energy */}
      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-3">
        <MoodPicker
          mood={mood}
          energy={energy}
          onMoodChange={setMood}
          onEnergyChange={setEnergy}
        />
      </div>

      {/* Content editor */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind..."
          className="w-full min-h-[50vh] p-4 text-gray-900 placeholder-gray-300 resize-none focus:outline-none text-[15px] leading-relaxed"
          autoFocus
        />
        <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
          <span>
            {wordCount} {wordCount === 1 ? "word" : "words"}
            {content.trim() && " \u00B7 auto-saved"}
          </span>
          <span className="text-gray-300">markdown supported</span>
        </div>
      </div>
    </form>
  );
}
