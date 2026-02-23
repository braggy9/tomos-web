"use client";

const moods = [
  { value: "great", emoji: "\u{1F929}", label: "Great" },
  { value: "good", emoji: "\u{1F60A}", label: "Good" },
  { value: "okay", emoji: "\u{1F610}", label: "Okay" },
  { value: "low", emoji: "\u{1F614}", label: "Low" },
  { value: "rough", emoji: "\u{1F62E}\u200D\u{1F4A8}", label: "Rough" },
] as const;

const energyLevels = [
  { value: "high", label: "High", color: "bg-green-100 text-green-700 border-green-300" },
  { value: "medium", label: "Medium", color: "bg-yellow-100 text-yellow-700 border-yellow-300" },
  { value: "low", label: "Low", color: "bg-red-100 text-red-700 border-red-300" },
] as const;

export function MoodPicker({
  mood,
  energy,
  onMoodChange,
  onEnergyChange,
}: {
  mood?: string | null;
  energy?: string | null;
  onMoodChange: (mood: string | null) => void;
  onEnergyChange: (energy: string | null) => void;
}) {
  return (
    <div className="space-y-3">
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Mood</label>
        <div className="flex gap-2 mt-1.5">
          {moods.map((m) => (
            <button
              key={m.value}
              type="button"
              onClick={() => onMoodChange(mood === m.value ? null : m.value)}
              className={`flex flex-col items-center gap-0.5 px-2.5 py-1.5 rounded-lg border transition-all text-sm ${
                mood === m.value
                  ? "border-brand-400 bg-brand-50 scale-110"
                  : "border-gray-200 bg-white hover:border-gray-300"
              }`}
            >
              <span className="text-lg">{m.emoji}</span>
              <span className="text-[10px] text-gray-500">{m.label}</span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <label className="text-xs font-medium text-gray-500 uppercase tracking-wider">Energy</label>
        <div className="flex gap-2 mt-1.5">
          {energyLevels.map((e) => (
            <button
              key={e.value}
              type="button"
              onClick={() => onEnergyChange(energy === e.value ? null : e.value)}
              className={`px-3 py-1 rounded-full border text-xs font-medium transition-all ${
                energy === e.value
                  ? e.color + " scale-105"
                  : "border-gray-200 bg-white text-gray-500 hover:border-gray-300"
              }`}
            >
              {e.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
