"use client";

type FilterValue = "all" | "active" | "draft" | "archived" | "pinned" | "confidential";

interface NoteFiltersProps {
  status: FilterValue;
  search: string;
  onStatusChange: (status: FilterValue) => void;
  onSearchChange: (search: string) => void;
}

const filterOptions: Array<{ value: FilterValue; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "draft", label: "Draft" },
  { value: "pinned", label: "Pinned" },
  { value: "confidential", label: "Confidential" },
  { value: "archived", label: "Archived" },
];

export function NoteFilters({
  status,
  search,
  onStatusChange,
  onSearchChange,
}: NoteFiltersProps) {
  return (
    <div className="space-y-3">
      <div className="relative">
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Filter notes..."
          value={search}
          onChange={(e) => onSearchChange(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        />
      </div>
      <div className="flex gap-1 overflow-x-auto">
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => onStatusChange(opt.value)}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              status === opt.value
                ? "bg-brand-600 text-white"
                : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </div>
  );
}
