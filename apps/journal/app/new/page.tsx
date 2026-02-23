"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useCreateEntry } from "../../hooks/useJournal";
import { MoodPicker } from "../../components/MoodPicker";
import { useToast } from "@tomos/ui";

export default function NewEntryPage() {
  const router = useRouter();
  const toast = useToast().toast;
  const createEntry = useCreateEntry();

  const [content, setContent] = useState("");
  const [mood, setMood] = useState<string | null>(null);
  const [energy, setEnergy] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    try {
      const result = await createEntry.mutateAsync({
        content: content.trim(),
        mood: mood as any,
        energy: energy as any,
      });
      toast("Entry saved");
      router.push(`/${result.data.id}`);
    } catch (err) {
      toast("Failed to save", "error");
    }
  };

  const today = new Date().toLocaleDateString("en-AU", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
    timeZone: "Australia/Sydney",
  });

  return (
    <form onSubmit={handleSubmit}>
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-xl font-bold text-gray-900">New Entry</h1>
          <p className="text-sm text-gray-500">{today}</p>
        </div>
        <button
          type="submit"
          disabled={!content.trim() || createEntry.isPending}
          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
        >
          {createEntry.isPending ? "Saving..." : "Save"}
        </button>
      </div>

      <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
        <MoodPicker
          mood={mood}
          energy={energy}
          onMoodChange={setMood}
          onEnergyChange={setEnergy}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder="What's on your mind..."
          className="w-full min-h-[300px] p-4 text-gray-900 placeholder-gray-400 resize-none focus:outline-none text-[15px] leading-relaxed"
          autoFocus
        />
        <div className="border-t border-gray-100 px-4 py-2 flex items-center justify-between text-xs text-gray-400">
          <span>{content.split(/\s+/).filter(Boolean).length} words</span>
          <span>Markdown supported</span>
        </div>
      </div>
    </form>
  );
}
