"use client";

import { useInsights, useSummaries, useGenerateSummary } from "../../hooks/useInsights";
import { Spinner, useToast } from "@tomos/ui";

const moodEmoji: Record<string, string> = {
  great: "\u{1F929}",
  good: "\u{1F60A}",
  okay: "\u{1F610}",
  low: "\u{1F614}",
  rough: "\u{1F62E}\u200D\u{1F4A8}",
};

export default function InsightsPage() {
  const { data: insights, isLoading } = useInsights(30);
  const { data: summaries } = useSummaries("weekly");
  const generateSummary = useGenerateSummary();
  const toast = useToast().toast;

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!insights) {
    return (
      <div className="text-center py-12 text-gray-400 text-sm">
        No data yet. Start writing journal entries to see insights.
      </div>
    );
  }

  const handleGenerateSummary = async () => {
    try {
      toast("Generating weekly summary...");
      await generateSummary.mutateAsync("weekly");
      toast("Summary generated!");
    } catch (err) {
      toast("Failed to generate summary", "error");
    }
  };

  return (
    <div>
      <h1 className="text-xl font-bold text-gray-900 mb-4">Insights</h1>

      {/* Stats grid */}
      <div className="grid grid-cols-2 gap-3 mb-6">
        <StatCard label="Current Streak" value={`${insights.stats.currentStreak} days`} />
        <StatCard label="This Month" value={`${insights.stats.periodEntries} entries`} />
        <StatCard label="Avg. Words" value={`${insights.stats.avgWordsPerEntry}`} />
        <StatCard label="Weekly Rate" value={`${insights.stats.entriesPerWeek}/week`} />
        <StatCard label="Total Entries" value={`${insights.stats.totalEntries}`} />
        <StatCard label="Chats" value={`${insights.stats.conversationsThisPeriod}`} />
      </div>

      {/* Mood distribution */}
      {Object.keys(insights.moods).length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Mood Distribution (30 days)
          </h2>
          <div className="space-y-2">
            {Object.entries(insights.moods)
              .sort((a, b) => b[1] - a[1])
              .map(([mood, count]) => {
                const total = Object.values(insights.moods).reduce((a, b) => a + b, 0);
                const pct = Math.round((count / total) * 100);
                return (
                  <div key={mood} className="flex items-center gap-2">
                    <span className="text-lg w-8 text-center">{moodEmoji[mood] || mood}</span>
                    <span className="text-xs text-gray-500 w-12 capitalize">{mood}</span>
                    <div className="flex-1 bg-gray-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="h-full bg-brand-400 rounded-full transition-all"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="text-xs text-gray-400 w-8 text-right">{count}</span>
                  </div>
                );
              })}
          </div>
        </div>
      )}

      {/* Top themes */}
      {insights.topThemes.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Top Themes (30 days)
          </h2>
          <div className="flex flex-wrap gap-2">
            {insights.topThemes.map(({ theme, count }) => (
              <span
                key={theme}
                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-brand-50 text-brand-600 text-xs border border-brand-100"
              >
                {theme}
                <span className="text-brand-400">{count}</span>
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Mood timeline */}
      {insights.moodTimeline.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider mb-3">
            Mood Timeline
          </h2>
          <div className="flex gap-1.5 items-end overflow-x-auto pb-1">
            {insights.moodTimeline.map((point, i) => {
              const moodLevel: Record<string, number> = {
                great: 5,
                good: 4,
                okay: 3,
                low: 2,
                rough: 1,
              };
              const level = moodLevel[point.mood] || 3;
              const height = level * 12;
              return (
                <div key={i} className="flex flex-col items-center gap-1 min-w-[28px]">
                  <div
                    className="w-5 bg-brand-300 rounded-t-sm transition-all"
                    style={{ height: `${height}px` }}
                    title={`${point.date}: ${point.mood}`}
                  />
                  <span className="text-[8px] text-gray-400">
                    {new Date(point.date).getDate()}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Weekly summaries */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-medium text-gray-500 uppercase tracking-wider">
            Weekly Summaries
          </h2>
          <button
            onClick={handleGenerateSummary}
            disabled={generateSummary.isPending}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-brand-600 text-white hover:bg-brand-700 disabled:opacity-50"
          >
            {generateSummary.isPending ? "Generating..." : "Generate"}
          </button>
        </div>

        {summaries && summaries.length > 0 ? (
          <div className="space-y-3">
            {summaries.map((summary) => (
              <div
                key={summary.id}
                className="bg-white rounded-xl border border-gray-200 p-4"
              >
                <p className="text-xs text-gray-500 mb-2">
                  {new Date(summary.periodStart).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                  })}{" "}
                  &ndash;{" "}
                  {new Date(summary.periodEnd).toLocaleDateString("en-AU", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
                <p className="text-sm text-gray-800 leading-relaxed whitespace-pre-wrap">
                  {summary.content}
                </p>
                {summary.themes.length > 0 && (
                  <div className="flex gap-1 mt-2 flex-wrap">
                    {summary.themes.map((t) => (
                      <span
                        key={t}
                        className="text-[10px] px-1.5 py-0.5 rounded-full bg-brand-50 text-brand-600"
                      >
                        {t}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-xl border border-gray-200 p-4 text-center text-sm text-gray-400">
            No summaries yet. Generate one after a week of journaling.
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl border border-gray-200 p-3">
      <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider">{label}</p>
      <p className="text-lg font-bold text-gray-900 mt-0.5">{value}</p>
    </div>
  );
}
