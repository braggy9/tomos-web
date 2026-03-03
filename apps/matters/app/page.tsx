"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { MatterStatus, MatterPriority } from "@tomos/api";
import { useFilteredMatters } from "../hooks/useMatters";
import { Badge, Spinner, EmptyState, Button, Card } from "@tomos/ui";
import { AppSwitcher } from "../components/AppSwitcher";

const CATEGORY_OPTIONS = [
  "Commercial",
  "Employment",
  "Privacy & Data",
  "Corporate",
  "Intellectual Property",
  "Regulatory",
  "Finance",
  "Property",
  "Technology",
  "Media & Marketing",
  "Procurement",
  "Compliance",
];

const statusOptions: Array<{ value: MatterStatus | "all"; label: string }> = [
  { value: "all", label: "All" },
  { value: "active", label: "Active" },
  { value: "on_hold", label: "On Hold" },
  { value: "completed", label: "Completed" },
];

export default function MattersPage() {
  const router = useRouter();
  const [status, setStatus] = useState<MatterStatus | "all">("active");
  const [priority, setPriority] = useState<MatterPriority | "all">("all");
  const [category, setCategory] = useState<string | "all">("all");
  const [search, setSearch] = useState("");
  const searchRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut: / focuses search
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement).tagName;
      if (e.key === "/" && !["INPUT", "TEXTAREA", "SELECT"].includes(tag)) {
        e.preventDefault();
        searchRef.current?.focus();
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const { data: mattersList, isLoading, error } = useFilteredMatters({
    status,
    priority,
    category,
    search,
  });

  const { data: allMatters } = useFilteredMatters({ status: "all" });
  const activeCount = allMatters?.filter((m) => m.status === "active").length ?? 0;
  const totalCount = allMatters?.length ?? 0;

  // Derive categories that actually exist in the data
  const existingCategories = Array.from(
    new Set(allMatters?.map((m) => m.practiceArea).filter(Boolean) as string[])
  ).sort();
  const categoryOptions = Array.from(new Set([...CATEGORY_OPTIONS, ...existingCategories])).sort();

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Matters</h1>
          <AppSwitcher />
        </div>
        <div className="flex items-center gap-3">
          {allMatters && (
            <span className="text-sm text-gray-500">
              {activeCount} active / {totalCount} total
            </span>
          )}
          <Link href="/new">
            <Button size="sm">New Matter</Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          ref={searchRef}
          type="text"
          placeholder="Search matters... (press / to focus)"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        />
      </div>

      {/* Status filter */}
      <div className="flex gap-1 overflow-x-auto">
        {statusOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setStatus(opt.value)}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              status === opt.value ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Category filter — only shown when categories exist */}
      {categoryOptions.length > 0 && (
        <div className="flex gap-1 overflow-x-auto">
          <button
            onClick={() => setCategory("all")}
            className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
              category === "all" ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
            }`}
          >
            All Categories
          </button>
          {existingCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                category === cat ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {isLoading && <Spinner className="py-12" />}
      {error && <EmptyState title="Failed to load matters" description={error.message} />}

      {mattersList && mattersList.length === 0 && !isLoading && (
        <EmptyState
          title="No matters found"
          description={search || status !== "all" || category !== "all" ? "Try adjusting your filters" : "Create a matter to get started"}
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          }
          action={
            status !== "all" || category !== "all" || search ? (
              <Button variant="secondary" onClick={() => { setStatus("all"); setCategory("all"); setSearch(""); }}>
                Clear filters
              </Button>
            ) : (
              <Link href="/new"><Button>New Matter</Button></Link>
            )
          }
        />
      )}

      {/* Matter Cards */}
      <div className="space-y-3">
        {mattersList?.map((matter) => (
          <Link key={matter.id} href={`/${matter.id}`}>
            <Card className="hover:border-gray-300 hover:shadow-md transition-all cursor-pointer mb-3">
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <h3 className="text-sm font-medium text-gray-900 truncate">{matter.title}</h3>
                  <p className="text-xs text-gray-500 mt-0.5">{matter.client}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="status" value={matter.status} />
                    <Badge variant="priority" value={matter.priority} />
                    {matter.practiceArea && <Badge value={matter.practiceArea} />}
                    {matter.jurisdiction && <Badge value={matter.jurisdiction} />}
                  </div>
                </div>
                <div className="text-right flex-shrink-0 space-y-0.5">
                  {matter._count && (
                    <div className="text-xs text-gray-400">
                      {matter._count.tasks > 0 && <p>{matter._count.tasks} tasks</p>}
                      {matter._count.documents > 0 && <p>{matter._count.documents} docs</p>}
                    </div>
                  )}
                  {matter.dueDate && (
                    <p className="text-xs text-gray-400">
                      Due {new Date(matter.dueDate).toLocaleDateString("en-AU", { day: "numeric", month: "short" })}
                    </p>
                  )}
                </div>
              </div>
              {matter.counterparty && (
                <p className="text-xs text-gray-400 mt-2">vs {matter.counterparty}</p>
              )}
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
