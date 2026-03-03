"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import { useCreateEntry } from "../../hooks/useJournal";
import { MoodPicker } from "../../components/MoodPicker";
import { useToast } from "@tomos/ui";
import Link from "next/link";

const DRAFT_KEY = "tomos-journal-draft";

interface Draft {
  title: string;
  content: string;
  mood: string | null;
  energy: string | null;
  savedAt: number;
}

type MarkdownAction = { prefix: string; suffix?: string; placeholder?: string };

const TOOLBAR_BUTTONS: Array<{ label: string; title: string } & MarkdownAction> = [
  { label: "H1", title: "Heading 1", prefix: "# ", placeholder: "Heading" },
  { label: "H2", title: "Heading 2", prefix: "## ", placeholder: "Heading" },
  { label: "B", title: "Bold", prefix: "**", suffix: "**", placeholder: "bold text" },
  { label: "I", title: "Italic", prefix: "*", suffix: "*", placeholder: "italic text" },
  { label: "›", title: "Blockquote", prefix: "> ", placeholder: "quote" },
  { label: "—", title: "List item", prefix: "- ", placeholder: "item" },
  { label: "☐", title: "Checkbox", prefix: "- [ ] ", placeholder: "task" },
];

export default function NewEntryPage() {
  const router = useRouter();
  const toast = useToast().toast;
  const createEntry = useCreateEntry();
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState("");
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
          setTitle(draft.title || "");
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
    if (content.trim() || title.trim()) {
      const draft: Draft = { title, content, mood, energy, savedAt: Date.now() };
      localStorage.setItem(DRAFT_KEY, JSON.stringify(draft));
    }
  }, [title, content, mood, energy]);

  useEffect(() => {
    const timer = setTimeout(saveDraft, 2000);
    return () => clearTimeout(timer);
  }, [saveDraft]);

  const clearDraft = () => {
    localStorage.removeItem(DRAFT_KEY);
    setHasDraft(false);
  };

  const insertMarkdown = (prefix: string, suffix?: string, placeholder?: string) => {
    const el = textareaRef.current;
    if (!el) return;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = content.slice(start, end) || placeholder || "";
    const suf = suffix ?? "";
    const before = content.slice(0, start);
    const after = content.slice(end);
    const newContent = `${before}${prefix}${selected}${suf}${after}`;
    setContent(newContent);
    // Restore focus + set cursor after inserted text
    requestAnimationFrame(() => {
      el.focus();
      const cursor = start + prefix.length + selected.length + suf.length;
      el.setSelectionRange(cursor, cursor);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const result = await createEntry.mutateAsync({
        title: title.trim() || undefined,
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
    setTitle("");
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
              setTitle("");
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

      {/* Title */}
      <input
        type="text"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        placeholder="Title (optional)"
        className="w-full px-4 py-2.5 text-base font-semibold text-gray-900 placeholder-gray-300 bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-brand-300 focus:ring-1 focus:ring-brand-200 transition-colors"
      />

      {/* Content editor */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm">
        {/* Markdown toolbar */}
        <div className="flex items-center gap-0.5 px-2 py-1.5 border-b border-gray-100 bg-gray-50">
          {TOOLBAR_BUTTONS.map((btn) => (
            <button
              key={btn.label}
              type="button"
              title={btn.title}
              onClick={() => insertMarkdown(btn.prefix, btn.suffix, btn.placeholder)}
              className="px-2 py-1 text-xs font-medium text-gray-500 hover:text-gray-800 hover:bg-white rounded transition-colors"
            >
              {btn.label}
            </button>
          ))}
        </div>

        <textarea
          ref={textareaRef}
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
