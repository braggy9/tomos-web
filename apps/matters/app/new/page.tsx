"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import { useCreateMatter } from "../../hooks/useMatters";
import type { MatterPriority, MatterStatus } from "@tomos/api";

const CATEGORY_SUGGESTIONS = [
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

const JURISDICTION_OPTIONS = [
  "NSW",
  "VIC",
  "QLD",
  "WA",
  "SA",
  "ACT",
  "NT",
  "TAS",
  "Commonwealth",
  "Federal Court",
  "International",
  "Multi-jurisdiction",
];

export default function NewMatterPage() {
  const router = useRouter();
  const { toast } = useToast();
  const createMatter = useCreateMatter();

  const [title, setTitle] = useState("");
  const [client, setClient] = useState("");
  const [type] = useState("advisory");
  const [priority, setPriority] = useState<MatterPriority>("medium");
  const [status, setStatus] = useState<MatterStatus>("active");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [jurisdiction, setJurisdiction] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [counterparty, setCounterparty] = useState("");
  const [counterpartyContact, setCounterpartyContact] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !client.trim()) return;

    createMatter.mutate(
      {
        title: title.trim(),
        client: client.trim(),
        type,
        priority,
        status,
        description: description.trim() || undefined,
        practiceArea: category.trim() || undefined,
        jurisdiction: jurisdiction.trim() || undefined,
        dueDate: dueDate || undefined,
        counterparty: counterparty.trim() || undefined,
        counterpartyContact: counterpartyContact.trim() || undefined,
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
            <label className="block text-sm font-medium text-gray-700 mb-1">Internal Client / Stakeholder *</label>
            <input type="text" value={client} onChange={(e) => setClient(e.target.value)} placeholder="e.g. Publicis Media, Finance Team..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
          </div>

          <div className="grid grid-cols-2 gap-3">
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
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as MatterStatus)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none">
                <option value="active">Active</option>
                <option value="on_hold">On Hold</option>
                <option value="completed">Completed</option>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
              <input
                type="text"
                list="category-suggestions"
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                placeholder="e.g. Commercial, Employment..."
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
              />
              <datalist id="category-suggestions">
                {CATEGORY_SUGGESTIONS.map((s) => <option key={s} value={s} />)}
              </datalist>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
              <input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)}
                className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Jurisdiction</label>
            <input
              type="text"
              list="jurisdiction-options"
              value={jurisdiction}
              onChange={(e) => setJurisdiction(e.target.value)}
              placeholder="Select or type..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none"
            />
            <datalist id="jurisdiction-options">
              {JURISDICTION_OPTIONS.map((j) => <option key={j} value={j} />)}
            </datalist>
          </div>

          {/* Counterparty */}
          <div className="pt-2 border-t border-gray-100">
            <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">Other Side</p>
            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Counterparty</label>
                <input type="text" value={counterparty} onChange={(e) => setCounterparty(e.target.value)}
                  placeholder="e.g. Accenture, Jane Smith (former employee)..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Their Contact / Counsel</label>
                <input type="text" value={counterpartyContact} onChange={(e) => setCounterpartyContact(e.target.value)}
                  placeholder="e.g. John Davies, Baker McKenzie..."
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
              </div>
            </div>
          </div>

        </div>

        <Button type="submit" loading={createMatter.isPending} disabled={!title.trim() || !client.trim()} className="w-full">
          Create Matter
        </Button>
      </form>
    </div>
  );
}
