"use client";

import { useState } from "react";

const apps = [
  { name: "Tasks", url: "https://tomos-tasks.vercel.app", icon: "\u2713", color: "bg-violet-100 text-violet-700" },
  { name: "Notes", url: "https://tomos-notes.vercel.app", icon: "\u270E", color: "bg-blue-100 text-blue-700" },
  { name: "Matters", url: "https://tomos-matters.vercel.app", icon: "\u2696", color: "bg-amber-100 text-amber-700" },
  { name: "Journal", url: "/", icon: "\u{1F4D6}", color: "bg-brand-100 text-brand-700", current: true },
];

export function AppSwitcher() {
  const [open, setOpen] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1 px-2 py-1 rounded-md text-xs font-medium text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6A2.25 2.25 0 016 3.75h2.25A2.25 2.25 0 0110.5 6v2.25a2.25 2.25 0 01-2.25 2.25H6a2.25 2.25 0 01-2.25-2.25V6zM3.75 15.75A2.25 2.25 0 016 13.5h2.25a2.25 2.25 0 012.25 2.25V18a2.25 2.25 0 01-2.25 2.25H6A2.25 2.25 0 013.75 18v-2.25zM13.5 6a2.25 2.25 0 012.25-2.25H18A2.25 2.25 0 0120.25 6v2.25A2.25 2.25 0 0118 10.5h-2.25a2.25 2.25 0 01-2.25-2.25V6zM13.5 15.75a2.25 2.25 0 012.25-2.25H18a2.25 2.25 0 012.25 2.25V18A2.25 2.25 0 0118 20.25h-2.25A2.25 2.25 0 0113.5 18v-2.25z" />
        </svg>
        Apps
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-1 z-50 bg-white rounded-lg shadow-lg border border-gray-200 p-2 w-44">
            {apps.map((app) => (
              <a
                key={app.name}
                href={app.current ? "/" : app.url}
                onClick={() => setOpen(false)}
                className={`flex items-center gap-2.5 px-2.5 py-2 rounded-md text-sm transition-colors ${
                  app.current
                    ? "bg-brand-50 text-brand-700 font-medium"
                    : "text-gray-700 hover:bg-gray-50"
                }`}
              >
                <span className={`w-6 h-6 rounded-md flex items-center justify-center text-xs ${app.color}`}>
                  {app.icon}
                </span>
                {app.name}
                {app.current && (
                  <span className="ml-auto text-[10px] text-brand-400">current</span>
                )}
              </a>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
