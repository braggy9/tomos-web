"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Entries",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
      </svg>
    ),
  },
  {
    href: "/new",
    label: "Write",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
      </svg>
    ),
    highlight: true,
  },
  {
    href: "/chat",
    label: "Chat",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
      </svg>
    ),
  },
  {
    href: "/insights",
    label: "Insights",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
      </svg>
    ),
  },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <>
      {/* Mobile bottom nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-sm border-t border-gray-200 lg:hidden pb-safe z-40">
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
                  item.highlight && !active
                    ? "text-brand-600"
                    : active
                      ? "text-brand-600"
                      : "text-gray-400 hover:text-gray-600"
                }`}
              >
                {item.highlight ? (
                  <span className={`p-1 rounded-full ${active ? "bg-brand-100" : "bg-brand-50"}`}>
                    {item.icon}
                  </span>
                ) : (
                  item.icon
                )}
                <span className="text-[10px] font-medium">{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Desktop sidebar */}
      <aside className="hidden lg:flex fixed left-0 top-0 bottom-0 w-56 flex-col bg-white border-r border-gray-200 z-40">
        <div className="p-4 border-b border-gray-200">
          <h1 className="text-lg font-bold text-brand-600">TomOS Journal</h1>
          <p className="text-[10px] text-gray-400 mt-0.5">Reflective journaling</p>
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

        {/* Markdown reference */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Markdown</p>
          <div className="px-3 space-y-1">
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">⌘N</span> — new entry</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500"># </span> Heading 1</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">## </span> Heading 2</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">**bold**</span> <span className="font-mono text-gray-500">*italic*</span></p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">&gt; </span> blockquote</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">- </span> list item</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">- [ ] </span> checkbox</p>
          </div>
        </div>

        {/* Cross-app links */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">
            TomOS Apps
          </p>
          {[
            { name: "Tasks", url: "https://tomos-tasks.vercel.app" },
            { name: "Notes", url: "https://tomos-notes.vercel.app" },
            { name: "Matters", url: "https://tomos-matters.vercel.app" },
          ].map((app) => (
            <a
              key={app.name}
              href={app.url}
              className="flex items-center gap-2 px-3 py-1.5 text-xs text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="w-1 h-1 rounded-full bg-gray-300" />
              {app.name}
            </a>
          ))}
        </div>
      </aside>
    </>
  );
}
