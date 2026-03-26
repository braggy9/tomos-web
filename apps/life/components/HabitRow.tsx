"use client";

interface HabitRowProps {
  id: string;
  title: string;
  icon: string | null;
  streak: number;
  completedToday: boolean;
  onToggle: (id: string, completed: boolean) => void;
}

export function HabitRow({ id, title, icon, streak, completedToday, onToggle }: HabitRowProps) {
  return (
    <button
      onClick={() => onToggle(id, !completedToday)}
      className="flex items-center gap-3 w-full px-3 py-3 rounded-xl bg-white border border-gray-100 hover:border-brand-200 transition-all group"
    >
      <div
        className={`w-7 h-7 rounded-full border-2 flex items-center justify-center transition-all ${
          completedToday
            ? "bg-brand-600 border-brand-600 text-white"
            : "border-gray-300 group-hover:border-brand-400"
        }`}
      >
        {completedToday && (
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </div>
      <span className="text-base mr-1">{icon || "+"}</span>
      <span className={`flex-1 text-left text-sm font-medium ${completedToday ? "text-gray-400 line-through" : "text-gray-800"}`}>
        {title}
      </span>
      {streak > 0 && (
        <span className="flex items-center gap-0.5 text-xs text-amber-600 font-medium">
          {streak >= 7 ? "\uD83D\uDD25" : "\u26A1"} {streak}d
        </span>
      )}
    </button>
  );
}
