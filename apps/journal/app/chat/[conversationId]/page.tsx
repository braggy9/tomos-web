"use client";

import { use, useState, useRef, useEffect } from "react";
import { useConversation, useSendMessage } from "../../../hooks/useChat";
import { Spinner, useToast } from "@tomos/ui";
import Link from "next/link";
import type { JournalMessage } from "@tomos/api";

export default function ConversationPage({
  params,
}: {
  params: Promise<{ conversationId: string }>;
}) {
  const { conversationId } = use(params);
  const toast = useToast().toast;
  const { data: conversation, isLoading } = useConversation(conversationId);
  const sendMessage = useSendMessage();

  const [extraMessages, setExtraMessages] = useState<JournalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const allMessages = [
    ...(conversation?.messages || []),
    ...extraMessages,
  ];

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [allMessages.length]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: JournalMessage = {
      id: `temp-${Date.now()}`,
      conversationId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setExtraMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const result = await sendMessage.mutateAsync({
        message: text,
        conversationId,
        entryId: conversation?.entry?.id || undefined,
      });
      setExtraMessages((prev) => [...prev, result.data.message]);
    } catch (err) {
      toast("Failed to send", "error");
      setExtraMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
    } finally {
      setIsSending(false);
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center py-12">
        <Spinner size="lg" />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100dvh-8rem)] lg:h-[calc(100dvh-3rem)]">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 shrink-0">
        <Link href="/chat" className="text-sm text-gray-500 hover:text-gray-700">
          &larr; Conversations
        </Link>
        <span className="text-xs text-gray-400 truncate ml-2">
          {conversation?.title || "Conversation"}
        </span>
      </div>

      {/* Linked entry banner */}
      {conversation?.entry && (
        <Link
          href={`/${conversation.entry.id}`}
          className="block bg-violet-50 border border-violet-200 rounded-lg p-2.5 mb-3 shrink-0"
        >
          <p className="text-xs text-violet-600 font-medium">
            Re: {conversation.entry.title || "Journal entry"} &middot;{" "}
            {new Date(conversation.entry.entryDate).toLocaleDateString("en-AU", {
              day: "numeric",
              month: "short",
            })}
          </p>
        </Link>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {allMessages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
                msg.role === "user"
                  ? "bg-brand-600 text-white rounded-br-sm"
                  : "bg-white border border-gray-200 text-gray-800 rounded-bl-sm"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          </div>
        ))}

        {isSending && (
          <div className="flex justify-start">
            <div className="bg-white border border-gray-200 rounded-2xl rounded-bl-sm px-4 py-3">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }} />
                <span className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Input */}
      <div className="shrink-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
        <textarea
          ref={inputRef}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type a message..."
          rows={2}
          className="w-full resize-none p-3 focus:outline-none text-sm text-gray-900 placeholder-gray-400"
          autoFocus
        />
        <div className="flex justify-between items-center px-3 pb-2">
          <span className="text-[10px] text-gray-400">Shift+Enter for new line</span>
          <button
            onClick={handleSend}
            disabled={!input.trim() || isSending}
            className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
}
