"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import { useCreateMatter } from "../../hooks/useMatters";
import type { MatterType, MatterPriority, Jurisdiction, BillingStatus } from "@tomos/api";

export default function NewMatterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMatter = useCreateMatter();

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [type, setType] = useState<MatterType>("contract");
  const [priority, setPriority] = useState<MatterPriority>("medium");
  const [description, setDescription] = useState("");
  const [matterNumber, setMatterNumber] = useState("");
  const [practiceArea, setPracticeArea] = useState("");
  const [jurisdiction, setJurisdiction] = useState<Jurisdiction | "">("");
  const [billingStatus, setBillingStatus] = useState<BillingStatus | "">("");
  const [dueDate, setDueDate] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !client.trim()) return;

    createMatter.mutate(
      {
        title: title.trim(),
        client: client.trim(),
        type,
        priority,
        description: description.trim() || undefined,
        matterNumber: matterNumber.trim() || undefined,
        practiceArea: practiceArea.trim() || undefined,
        jurisdiction: jurisdiction || undefined,
        billingStatus: billingStatus || undefined,
        dueDate: dueDate || undefined,
        leadCounsel: "Tom Bragg",
        createdBy: "Tom Bragg",
      },
      {
        onSuccess: () => {
          toast("Matter created");
          router.push("/");
        },
        onError: () => toast("Failed to create matter", "error"),
      }
    );
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => router.push("/")} className="p-1.5 rounded-lg hover:bg-gray-100 transition-colors">
          <svg className="w-5 h-5 text-gray-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" />
          </svg>
        </button>
        <h1 className="text-xl font-bold text-gray-900">New Matter</h1>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Title *</label>
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Matter title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" autoFocus />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client *</label>
            <input type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="Client name..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
              <select value={type} onChange={(e) => setType(e.target.value as MatterType)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none">
                <option value="contract">Contract</option>
                <option value="dispute">Dispute</option>
                <option value="compliance">Compliance</option>
                <option value="advisory">Advisory</option>
                <option value="employment">Employment</option>
                <option value="ip">IP</option>
                <option value="regulatory">Regulatory</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value as MatterPriority)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none">
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} placeholder="Brief description..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-y" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Matter Number</label>
              <input type="text" value={matterNumber} onChange={(e) => setMatterNumber(e.target.value)} placeholder="PUB-2026-001"
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
              <select value={jurisdiction} onChange={(e) => setJurisdiction(e.target.value as Jurisdiction)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none">
                <option value="">Select...</option>
                <option value="NSW">NSW</option>
                <option value="VIC">VIC</option>
                <option value="Commonwealth">Commonwealth</option>
                <option value="International">International</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Billing</label>
              <select value={billingStatus} onChange={(e) => setBillingStatus(e.target.value as BillingStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none">
                <option value="">Select...</option>
                <option value="billable">Billable</option>
                <option value="non_billable">Non-billable</option>
                <option value="fixed_fee">Fixed Fee</option>
                <option value="time_and_materials">Time & Materials</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Practice Area</label>
            <input type="text" value={practiceArea} onChange={(e) => setPracticeArea(e.target.value)} placeholder="e.g. Commercial, Employment"
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
          </div>
        </div>

        <Button type="submit" loading={createMatter.isPending} disabled={!title.trim() || !client.trim()} className="w-full">
          Create Matter
        </Button>
      </form>
    </div>
  );
}
