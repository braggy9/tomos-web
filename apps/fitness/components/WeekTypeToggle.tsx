"use client";

import type { FitnessWeekType } from "@tomos/api";

interface WeekTypeToggleProps {
  value: FitnessWeekType;
  onChange: (v: FitnessWeekType) => void;
}

export function WeekTypeToggle({ value, onChange }: WeekTypeToggleProps) {
  return (
    <div className="flex bg-gray-100 rounded-lg p-0.5">
      <button
        onClick={() => onChange("non-kid")}
        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          value === "non-kid"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Full Week
      </button>
      <button
        onClick={() => onChange("kid")}
        className={`flex-1 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
          value === "kid"
            ? "bg-white text-gray-900 shadow-sm"
            : "text-gray-500 hover:text-gray-700"
        }`}
      >
        Kid Week
      </button>
    </div>
  );
}
