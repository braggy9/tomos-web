"use client";

import { useState } from "react";
import { useDocuments, useCreateDocument } from "../../hooks/useMatters";
import { Card, Badge, Spinner, EmptyState, Button } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import type { DocumentType, DocumentStatus } from "@tomos/api";

export function DocumentsTab({ matterId }: { matterId: string }) {
  const { data: docs, isLoading } = useDocuments(matterId);
  const createDoc = useCreateDocument();
  const { toast } = useToast();
  const [showAdd, setShowAdd] = useState(false);
  const [title, setTitle] = useState("");
  const [type, setType] = useState<DocumentType>("contract");
  const [docStatus, setDocStatus] = useState<DocumentStatus>("draft");
  const [fileUrl, setFileUrl] = useState("");
  const [description, setDescription] = useState("");

  const handleAdd = () => {
    if (!title.trim()) return;
    createDoc.mutate(
      {
        matterId,
        data: {
          title: title.trim(),
          type,
          status: docStatus,
          fileUrl: fileUrl.trim() || undefined,
          description: description.trim() || undefined,
          author: "Tom Bragg",
        },
      },
      {
        onSuccess: () => {
          toast("Document added");
          setShowAdd(false);
          setTitle("");
          setFileUrl("");
          setDescription("");
        },
        onError: () => toast("Failed to add document", "error"),
      }
    );
  };

  if (isLoading) return <Spinner className="py-8" />;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">Documents</h3>
        <Button size="sm" variant="secondary" onClick={() => setShowAdd(!showAdd)}>
          {showAdd ? "Cancel" : "Add Document"}
        </Button>
      </div>

      {showAdd && (
        <Card>
          <div className="space-y-3">
            <input type="text" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Document title..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" autoFocus />
            <div className="grid grid-cols-2 gap-3">
              <select value={type} onChange={(e) => setType(e.target.value as DocumentType)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:outline-none">
                <option value="contract">Contract</option>
                <option value="email">Email</option>
                <option value="memo">Memo</option>
                <option value="correspondence">Correspondence</option>
                <option value="court_filing">Court Filing</option>
                <option value="research">Research</option>
              </select>
              <select value={docStatus} onChange={(e) => setDocStatus(e.target.value as DocumentStatus)}
                className="px-3 py-2 text-sm border border-gray-300 rounded-lg bg-white focus:border-brand-500 focus:outline-none">
                <option value="draft">Draft</option>
                <option value="final">Final</option>
                <option value="executed">Executed</option>
                <option value="superseded">Superseded</option>
              </select>
            </div>
            <input type="text" value={fileUrl} onChange={(e) => setFileUrl(e.target.value)} placeholder="File URL (optional)..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none" />
            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Description (optional)..."
              className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 focus:outline-none resize-y" />
            <Button size="sm" onClick={handleAdd} loading={createDoc.isPending} disabled={!title.trim()}>Add</Button>
          </div>
        </Card>
      )}

      {docs && docs.length === 0 && (
        <EmptyState title="No documents" description="Add documents to this matter" />
      )}

      {docs?.map((doc) => (
        <Card key={doc.id}>
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-medium text-gray-900">{doc.title}</h4>
              {doc.description && <p className="text-xs text-gray-500 mt-0.5">{doc.description}</p>}
              <div className="flex items-center gap-2 mt-1.5">
                <Badge value={doc.type} />
                {doc.status && <Badge variant="status" value={doc.status} />}
                {doc.version && <span className="text-xs text-gray-400">{doc.version}</span>}
              </div>
            </div>
            {doc.fileUrl && (
              <a href={doc.fileUrl} target="_blank" rel="noopener noreferrer"
                className="text-xs text-brand-600 hover:underline flex-shrink-0">Open</a>
            )}
          </div>
          <div className="text-xs text-gray-400 mt-2">
            {doc.author && `By ${doc.author} · `}
            {new Date(doc.createdAt).toLocaleDateString("en-AU")}
          </div>
        </Card>
      ))}
    </div>
  );
}
