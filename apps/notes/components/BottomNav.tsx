"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Notes",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
      </svg>
    ),
  },
  {
    href: "/new",
    label: "New",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
  },
  {
    href: "/search",
    label: "Search",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 lg:hidden pb-safe z-40">
        <div className="flex items-center justify-around h-14">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.match(/^\/[a-f0-9-]+$/)
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex flex-col items-center justify-center gap-0.5 px-3 py-1 rounded-lg transition-colors ${
                  active ? "text-brand-600" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                {item.icon}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 flex-col bg-white border-r border-gray-200 z-40">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-brand-600">TomOS Notes</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.match(/^\/[a-f0-9-]+$/)
                : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  active
                    ? "bg-brand-50 text-brand-700"
                    : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                {item.icon}
                {item.label}
              </Link>
            );
          })}
        </nav>
        {/* Smart linking syntax */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Smart Links</p>
          <div className="px-3 space-y-1">
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">⌘N</span> — new note</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">@task</span> — link a task</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">#matter</span> — link a matter</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">&amp;project</span> — link a project</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">[[note]]</span> — link a note</p>
          </div>
        </div>
        {/* Cross-app links */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">TomOS Apps</p>
          {[
            { name: "Tasks", url: "https://tomos-tasks.vercel.app" },
            { name: "Matters", url: "https://tomos-matters.vercel.app" },
            { name: "Journal", url: "https://tomos-journal.vercel.app" },
            { name: "Fitness", url: "https://tomos-fitness.vercel.app" },
          ].map((app) => (
            <a key={app.name} href={app.url} className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors">
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {app.name}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
