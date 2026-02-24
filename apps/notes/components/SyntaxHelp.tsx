"use client";

import { useState } from "react";

export function SyntaxHelp() {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="text-xs text-gray-400 hover:text-violet-600 transition-colors flex items-center gap-1"
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
        </svg>
        {open ? "Hide" : "Smart"} linking syntax
      </button>

      {open && (
        <div className="mt-2 bg-gray-50 border border-gray-200 rounded-lg p-3 text-xs text-gray-600 space-y-1.5">
          <p className="font-medium text-gray-700 mb-2">Link to other items:</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-1">
            <code className="text-violet-600">@task-name</code>
            <span>Link to a task</span>
            <code className="text-violet-600">@&quot;task with spaces&quot;</code>
            <span>Quoted task name</span>
            <code className="text-violet-600">#PUB-2026-001</code>
            <span>Matter by number</span>
            <code className="text-violet-600">#&quot;Matter Title&quot;</code>
            <span>Matter by title</span>
            <code className="text-violet-600">#keyword</code>
            <span>Matter by keyword</span>
            <code className="text-violet-600">&amp;project-name</code>
            <span>Link to a project</span>
            <code className="text-violet-600">[[Note Title]]</code>
            <span>Link to another note</span>
          </div>
        </div>
      )}
    </div>
  );
}
