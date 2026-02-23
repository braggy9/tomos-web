"use client";

import Link from "next/link";
import type { JournalEntry } from "@tomos/api";

const moodEmoji: Record<string, string> = {
  great: "\u{1F929}",
  good: "\u{1F60A}",
  okay: "\u{1F610}",
  low: "\u{1F614}",
  rough: "\u{1F62E}\u200D\u{1F4A8}",
};

export function EntryRow({ entry }: { entry: JournalEntry }) {
  const date = new Date(entry.entryDate);
  const isToday = new Date().toDateString() === date.toDateString();
  const isYesterday =
    new Date(Date.now() - 86400000).toDateString() === date.toDateString();

  const dateLabel = isToday
    ? "Today"
    : isYesterday
      ? "Yesterday"
      : date.toLocaleDateString("en-AU", {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

  return (
    <Link
      href={`/${entry.id}`}
      className="block bg-white rounded-xl border border-gray-200 p-4 hover:border-violet-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-medium text-gray-500">{dateLabel}</span>
            {entry.mood && (
              <span className="text-sm" title={entry.mood}>
                {moodEmoji[entry.mood] || entry.mood}
              </span>
            )}
            {entry.energy && (
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full font-medium ${
                  entry.energy === "high"
                    ? "bg-green-100 text-green-600"
                    : entry.energy === "medium"
                      ? "bg-yellow-100 text-yellow-600"
                      : "bg-red-100 text-red-600"
                }`}
              >
                {entry.energy}
              </span>
            )}
          </div>

          {entry.title && (
            <h3 className="font-medium text-gray-900 truncate text-sm">
              {entry.title}
            </h3>
          )}

          <p className="text-sm text-gray-500 line-clamp-2 mt-0.5">
            {entry.excerpt || entry.content.substring(0, 150)}
          </p>

          {entry.themes.length > 0 && (
            <div className="flex gap-1 mt-2 flex-wrap">
              {entry.themes.slice(0, 4).map((theme) => (
                <span
                  key={theme}
                  className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600"
                >
                  {theme}
                </span>
              ))}
            </div>
          )}
        </div>

        <div className="text-right shrink-0">
          <span className="text-[10px] text-gray-400">
            {entry.wordCount}w
          </span>
          {entry.reflection && (
            <div className="mt-1">
              <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-violet-50 text-violet-500">
                reflected
              </span>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
}
