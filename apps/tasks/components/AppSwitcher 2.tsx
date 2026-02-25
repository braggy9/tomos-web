"use client";
import { useState, useRef, useEffect } from "react";

const apps = [
  { name: "Tasks", url: "https://tomos-tasks.vercel.app", icon: "\u2713", color: "bg-violet-100 text-violet-700", current: true },
  { name: "Notes", url: "https://tomos-notes.vercel.app", icon: "\u270E", color: "bg-blue-100 text-blue-700", current: false },
  { name: "Matters", url: "https://tomos-matters.vercel.app", icon: "\u2696", color: "bg-amber-100 text-amber-700", current: false },
  { name: "Journal", url: "https://tomos-journal.vercel.app", icon: "\uD83D\uDCD6", color: "bg-green-100 text-green-700", current: false },
];

export function AppSwitcher() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const currentApp = apps.find((a) => a.current)!;

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen(!open)}
        className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-medium transition-colors ${currentApp.color} hover:opacity-80`}
      >
        <span>{currentApp.icon}</span>
        <span>{currentApp.name}</span>
        <svg className="w-3 h-3 opacity-60" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </button>

      {open && (
        <div className="absolute top-full left-0 mt-1 w-48 bg-white rounded-xl border border-gray-200 shadow-lg py-1 z-50">
          <p className="px-3 py-1.5 text-[10px] font-medium text-gray-400 uppercase tracking-wider">TomOS Apps</p>
          {apps.map((app) => (
            <a
              key={app.name}
              href={app.url}
              className={`flex items-center gap-2.5 px-3 py-2 text-sm transition-colors ${
                app.current
                  ? "bg-gray-50 text-gray-900 font-medium"
                  : "text-gray-600 hover:bg-gray-50"
              }`}
            >
              <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${app.color}`}>
                {app.icon}
              </span>
              <span>{app.name}</span>
              {app.current && (
                <svg className="w-3.5 h-3.5 ml-auto text-brand-600" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              )}
            </a>
          ))}
        </div>
      )}
    </div>
  );
}
