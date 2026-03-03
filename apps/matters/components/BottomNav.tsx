"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  {
    href: "/",
    label: "Matters",
    icon: (
      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
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
                ? pathname === "/" || pathname.match(/^\/[a-f0-9-]+/)
                : pathname === item.href;
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
          <h1 className="text-lg font-bold text-brand-600">TomOS Matters</h1>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {navItems.map((item) => {
            const active =
              item.href === "/"
                ? pathname === "/" || pathname.match(/^\/[a-f0-9-]+/)
                : pathname === item.href;
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
        {/* Shortcuts */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">Shortcuts</p>
          <div className="px-3 space-y-1">
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">⌘N</span> — new matter</p>
            <p className="text-[10px] text-gray-400"><span className="font-mono text-gray-500">/</span> — focus search</p>
          </div>
        </div>
        {/* Cross-app links */}
        <div className="p-3 border-t border-gray-100">
          <p className="text-[10px] font-medium text-gray-400 uppercase tracking-wider px-3 mb-2">TomOS Apps</p>
          {[
            { name: "Tasks", url: "https://tomos-tasks.vercel.app" },
            { name: "Notes", url: "https://tomos-notes.vercel.app" },
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
