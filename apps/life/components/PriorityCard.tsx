"use client";

const categoryColors: Record<string, string> = {
  health: "bg-green-100 text-green-700",
  family: "bg-pink-100 text-pink-700",
  career: "bg-blue-100 text-blue-700",
  financial: "bg-amber-100 text-amber-700",
  creative: "bg-purple-100 text-purple-700",
  social: "bg-cyan-100 text-cyan-700",
  learning: "bg-indigo-100 text-indigo-700",
};

interface PriorityCardProps {
  title: string;
  category?: string;
  status?: string;
}

export function PriorityCard({ title, category, status }: PriorityCardProps) {
  const colorClass = category ? categoryColors[category] || "bg-gray-100 text-gray-600" : "";

  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-100">
      <div className={`w-1.5 h-8 rounded-full ${status === "done" ? "bg-green-400" : "bg-brand-400"}`} />
      <span className={`flex-1 text-sm font-medium ${status === "done" ? "text-gray-400 line-through" : "text-gray-800"}`}>
        {title}
      </span>
      {category && (
        <span className={`text-[10px] font-medium px-2 py-0.5 rounded-full ${colorClass}`}>
          {category}
        </span>
      )}
    </div>
  );
}
