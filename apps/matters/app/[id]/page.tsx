"use client";

import { use, useState } from "react";
import { useRouter } from "next/navigation";
import { useMatter, useUpdateMatter, useDeleteMatter } from "../../hooks/useMatters";
import { Badge, Button, Card, Spinner } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import { DocumentsTab } from "./DocumentsTab";
import { TimelineTab } from "./TimelineTab";
import { NotesTab } from "./NotesTab";
import type { MatterStatus } from "@tomos/api";

type Tab = "overview" | "documents" | "timeline" | "notes";

export default function MatterDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { toast } = useToast();
  const { data: matter, isLoading } = useMatter(id);
  const updateMatter = useUpdateMatter();
  const deleteMatter = useDeleteMatter();
  const [tab, setTab] = useState<Tab>("overview");

  if (isLoading) return <Spinner className="py-12" />;
  if (!matter) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Matter not found</p>
        <Button variant="ghost" onClick={() => router.push("/")} className="mt-2">Back</Button>
      </div>
    );
  }

  const handleStatusChange = (newStatus: MatterStatus) => {
    updateMatter.mutate(
      { id: matter.id, data: { status: newStatus, updatedBy: "Tom Bragg" } },
      {
        onSuccess: () => toast(`Matter ${newStatus.replace("_", " ")}`),
        onError: () => toast("Failed to update status", "error"),
      }
    );
  };

  const handleDelete = () => {
    if (!confirm("Archive this matter?")) return;
    deleteMatter.mutate(matter.id, {
      onSuccess: () => {
        toast("Matter archived");
        router.push("/");
      },
      onError: () => toast("Failed to archive", "error"),
    });
  };

  const tabs: Array<{ key: Tab; label: string; count?: number }> = [
    { key: "overview", label: "Overview" },
    { key: "documents", label: "Documents", count: matter._count?.documents },
    { key: "timeline", label: "Timeline", count: matter._count?.events },
    { key: "notes", label: "Notes", count: matter._count?.notes },
  ];

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/")} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-bold text-gray-900 truncate">{matter.title}</h1>
          <p className="text-sm text-gray-500">{matter.client}{matter.practiceArea && ` · ${matter.practiceArea}`}</p>
        </div>
      </div>

      {/* Status badges */}
      <div className="flex items-center gap-2 flex-wrap">
        <Badge variant="status" value={matter.status} />
        <Badge variant="priority" value={matter.priority} />
        {matter.practiceArea && <Badge value={matter.practiceArea} />}
        {matter.jurisdiction && <Badge value={matter.jurisdiction} />}
      </div>

      {/* Tab navigation */}
      <div className="flex gap-1 overflow-x-auto border-b border-gray-200">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium whitespace-nowrap border-b-2 transition-colors ${
              tab === t.key
                ? "border-brand-600 text-brand-600"
                : "border-transparent text-gray-500 hover:text-gray-700"
            }`}
          >
            {t.label}
            {t.count !== undefined && (
              <span className="ml-1.5 text-xs text-gray-400">({t.count})</span>
            )}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "overview" && (
        <div className="space-y-4">
          {/* Stat cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <Card>
              <p className="text-2xl font-bold text-gray-900">{matter._count?.tasks ?? 0}</p>
              <p className="text-xs text-gray-500">Tasks</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-gray-900">{matter._count?.documents ?? 0}</p>
              <p className="text-xs text-gray-500">Documents</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-gray-900">{matter._count?.events ?? 0}</p>
              <p className="text-xs text-gray-500">Events</p>
            </Card>
            <Card>
              <p className="text-2xl font-bold text-gray-900">{matter._count?.notes ?? 0}</p>
              <p className="text-xs text-gray-500">Notes</p>
            </Card>
          </div>

          {/* Description */}
          {matter.description && (
            <Card>
              <h3 className="text-sm font-medium text-gray-700 mb-1">Description</h3>
              <p className="text-sm text-gray-600">{matter.description}</p>
            </Card>
          )}

          {/* Details */}
          <Card>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Details</h3>
            <dl className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
              {matter.leadCounsel && (
                <><dt className="text-gray-500">Lead Counsel</dt><dd className="text-gray-900">{matter.leadCounsel}</dd></>
              )}
              {matter.clientContact && (
                <><dt className="text-gray-500">Client Contact</dt><dd className="text-gray-900">{matter.clientContact}</dd></>
              )}
              {matter.practiceArea && (
                <><dt className="text-gray-500">Category</dt><dd className="text-gray-900">{matter.practiceArea}</dd></>
              )}
              {matter.dueDate && (
                <><dt className="text-gray-500">Due Date</dt><dd className="text-gray-900">{new Date(matter.dueDate).toLocaleDateString("en-AU")}</dd></>
              )}
              {matter.budget && (
                <><dt className="text-gray-500">Budget</dt><dd className="text-gray-900">${Number(matter.budget).toLocaleString()}</dd></>
              )}
              {matter.actualSpend && (
                <><dt className="text-gray-500">Actual Spend</dt><dd className="text-gray-900">${Number(matter.actualSpend).toLocaleString()}</dd></>
              )}
              {matter.teamMembers.length > 0 && (
                <><dt className="text-gray-500">Team</dt><dd className="text-gray-900">{matter.teamMembers.join(", ")}</dd></>
              )}
              {(matter.counterparty || matter.counterpartyContact) && (
                <div className="col-span-2 pt-2 border-t border-gray-100 mt-1">
                  <p className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider mb-2">Other Side</p>
                </div>
              )}
              {matter.counterparty && (
                <><dt className="text-gray-500">Counterparty</dt><dd className="text-gray-900">{matter.counterparty}</dd></>
              )}
              {matter.counterpartyContact && (
                <><dt className="text-gray-500">Their Contact</dt><dd className="text-gray-900">{matter.counterpartyContact}</dd></>
              )}
              <dt className="text-gray-500">Last Activity</dt>
              <dd className="text-gray-900">{new Date(matter.lastActivityAt).toLocaleString("en-AU")}</dd>
            </dl>
          </Card>

          {/* Tasks */}
          {matter.tasks && matter.tasks.length > 0 && (
            <Card>
              <h3 className="text-sm font-medium text-gray-700 mb-2">Tasks ({matter.tasks.length})</h3>
              <div className="space-y-2">
                {matter.tasks.map((task) => (
                  <div key={task.id} className="flex items-center gap-2 text-sm">
                    <Badge variant="status" value={task.status} />
                    <span className="text-gray-900 truncate">{task.title}</span>
                    <Badge variant="priority" value={task.priority} />
                  </div>
                ))}
              </div>
            </Card>
          )}

          {/* Status actions */}
          <div className="flex flex-wrap gap-2">
            {matter.status === "active" && (
              <>
                <Button variant="secondary" size="sm" onClick={() => handleStatusChange("on_hold")}>Put on Hold</Button>
                <Button variant="secondary" size="sm" onClick={() => handleStatusChange("completed")}>Complete</Button>
              </>
            )}
            {matter.status === "on_hold" && (
              <Button variant="secondary" size="sm" onClick={() => handleStatusChange("active")}>Reactivate</Button>
            )}
            {matter.status === "completed" && (
              <Button variant="secondary" size="sm" onClick={() => handleStatusChange("active")}>Reopen</Button>
            )}
            <Button variant="destructive" size="sm" onClick={handleDelete}>Archive</Button>
          </div>

          <div className="text-xs text-gray-400 space-y-0.5">
            <p>Created: {new Date(matter.createdAt).toLocaleString("en-AU")}</p>
            <p>Updated: {new Date(matter.updatedAt).toLocaleString("en-AU")}</p>
          </div>
        </div>
      )}

      {tab === "documents" && <DocumentsTab matterId={id} />}
      {tab === "timeline" && <TimelineTab matterId={id} />}
      {tab === "notes" && <NotesTab matterId={id} />}
    </div>
  );
}
