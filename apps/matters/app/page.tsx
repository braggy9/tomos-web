"use client";

import { useState } from "react";
import Link from "next/link";
import type { MatterStatus, MatterPriority, MatterType } from "@tomos/api";
import { useFilteredMatters } from "../hooks/useMatters";
import { Badge, Spinner, EmptyState, Button, Card } from "@tomos/ui";
import { AppSwitcher } from "../components/AppSwitcher";

export default function MattersPage() {
  const [status, setStatus] = useState<MatterStatus | "all">("all");
  const [priority, setPriority] = useState<MatterPriority | "all">("all");
  const [type, setType] = useState<MatterType | "all">("all");
  const [search, setSearch] = useState("");

  const { data: mattersList, isLoading, error } = useFilteredMatters({
    status,
    priority,
    type,
    search,
  });

  const statusOptions: Array<{ value: MatterStatus | "all"; label: string }> = [
    { value: "all", label: "All" },
    { value: "active", label: "Active" },
    { value: "on_hold", label: "On Hold" },
    { value: "completed", label: "Completed" },
    { value: "archived", label: "Archived" },
  ];

  const typeOptions: Array<{ value: MatterType | "all"; label: string }> = [
    { value: "all", label: "All Types" },
    { value: "contract", label: "Contract" },
    { value: "dispute", label: "Dispute" },
    { value: "compliance", label: "Compliance" },
    { value: "advisory", label: "Advisory" },
    { value: "employment", label: "Employment" },
    { value: "ip", label: "IP" },
    { value: "regulatory", label: "Regulatory" },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <h1 className="text-xl font-bold text-gray-900">Matters</h1>
          <AppSwitcher />
        </div>
        <Link href="/new">
          <Button size="sm">New Matter</Button>
        </Link>
      </div>

      {/* Search */}
      <div className="relative">
        <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
        </svg>
        <input
          type="text"
          placeholder="Search matters..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
        />
      </div>

      {/* Filters */}
      <div className="space-y-2">
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
        <div className="flex gap-1 overflow-x-auto">
          {typeOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setType(opt.value)}
              className={`px-3 py-1 text-xs font-medium rounded-full whitespace-nowrap transition-colors ${
                type === opt.value ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {isLoading && <Spinner className="py-12" />}
      {error && <EmptyState title="Failed to load matters" description={error.message} />}

      {mattersList && mattersList.length === 0 && (
        <EmptyState
          title="No matters found"
          description="Create a matter to get started"
          icon={
            <svg className="w-10 h-10" fill="none" viewBox="0 0 24 24" strokeWidth={1} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 00.75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 00-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0112 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 01-.673-.38m0 0A2.18 2.18 0 013 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 013.413-.387m7.5 0V5.25A2.25 2.25 0 0013.5 3h-3a2.25 2.25 0 00-2.25 2.25v.894m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
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
                  <div className="flex items-center gap-2">
                    <h3 className="text-sm font-medium text-gray-900 truncate">{matter.title}</h3>
                    {matter.matterNumber && (
                      <span className="text-xs text-gray-400 flex-shrink-0">{matter.matterNumber}</span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5">{matter.client}</p>
                  <div className="flex items-center gap-2 mt-2 flex-wrap">
                    <Badge variant="status" value={matter.status} />
                    <Badge variant="priority" value={matter.priority} />
                    <Badge value={matter.type} />
                    {matter.jurisdiction && <Badge value={matter.jurisdiction} />}
                  </div>
                </div>
                <div className="text-right flex-shrink-0">
                  {matter._count && (
                    <div className="text-xs text-gray-400 space-y-0.5">
                      <p>{matter._count.tasks} tasks</p>
                      <p>{matter._count.documents} docs</p>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
