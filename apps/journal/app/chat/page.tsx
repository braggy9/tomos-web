"use client";

import { Suspense, useState, useRef, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { useSendMessage, useConversations } from "../../hooks/useChat";
import { Spinner, useToast } from "@tomos/ui";
import Link from "next/link";
import type { JournalMessage } from "@tomos/api";

export default function ChatPage() {
  return (
    <Suspense fallback={<div className="flex justify-center py-12"><Spinner size="lg" /></div>}>
      <ChatPageInner />
    </Suspense>
  );
}

function ChatPageInner() {
  const searchParams = useSearchParams();
  const entryId = searchParams.get("entryId");
  const toast = useToast().toast;
  const sendMessage = useSendMessage();
  const { data: conversations, isLoading: loadingConversations } = useConversations();

  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<JournalMessage[]>([]);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async () => {
    const text = input.trim();
    if (!text || isSending) return;

    const userMsg: JournalMessage = {
      id: `temp-${Date.now()}`,
      conversationId: conversationId || "",
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setIsSending(true);

    try {
      const result = await sendMessage.mutateAsync({
        message: text,
        conversationId: conversationId || undefined,
        entryId: entryId || undefined,
      });

      setConversationId(result.data.conversationId);
      setMessages((prev) => [...prev, result.data.message]);
    } catch (err) {
      toast("Failed to send message", "error");
      // Remove the optimistic user message on error
      setMessages((prev) => prev.filter((m) => m.id !== userMsg.id));
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

  // Show conversation list when no active conversation and no entryId
  if (!conversationId && !entryId && messages.length === 0) {
    return (
      <div>
        <div className="flex items-center justify-between mb-4">
          <h1 className="text-xl font-bold text-gray-900">Chat</h1>
          <button
            onClick={() => {
              setMessages([]);
              setConversationId(null);
            }}
            className="px-3 py-1.5 text-xs font-medium rounded-lg bg-brand-600 text-white hover:bg-brand-700"
          >
            New Chat
          </button>
        </div>

        <p className="text-sm text-gray-500 mb-4">
          Talk to your journal companion. They know your entries, notice patterns, and help you think out loud.
        </p>

        {/* Quick start */}
        <div
          className="bg-white rounded-xl border border-gray-200 p-4 mb-4 cursor-pointer hover:border-violet-300 transition-colors"
          onClick={() => inputRef.current?.focus()}
        >
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="What's on your mind..."
            rows={3}
            className="w-full resize-none focus:outline-none text-sm text-gray-900 placeholder-gray-400"
          />
          <div className="flex justify-end mt-2">
            <button
              onClick={handleSend}
              disabled={!input.trim()}
              className="px-3 py-1.5 rounded-lg bg-brand-600 text-white text-xs font-medium hover:bg-brand-700 disabled:opacity-50"
            >
              Send
            </button>
          </div>
        </div>

        {/* Previous conversations */}
        {loadingConversations && <Spinner size="sm" />}
        {conversations && conversations.length > 0 && (
          <div>
            <h2 className="text-sm font-medium text-gray-500 mb-2">Previous Conversations</h2>
            <div className="space-y-1.5">
              {conversations.map((conv) => (
                <Link
                  key={conv.id}
                  href={`/chat/${conv.id}`}
                  className="block bg-white rounded-lg border border-gray-200 p-3 hover:border-violet-300 transition-colors"
                >
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {conv.title || "Untitled conversation"}
                  </p>
                  <p className="text-xs text-gray-500 mt-0.5">
                    {new Date(conv.createdAt).toLocaleDateString("en-AU", {
                      day: "numeric",
                      month: "short",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                    {conv.entry && ` \u00B7 Re: ${conv.entry.title || "entry"}`}
                  </p>
                </Link>
              ))}
            </div>
          </div>
        )}
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
        <span className="text-xs text-gray-400">
          {messages.length} messages
        </span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto space-y-3 mb-3">
        {messages.length === 0 && (
          <div className="text-center py-12 text-gray-400 text-sm">
            Start a conversation. Your companion has context from your journal entries.
          </div>
        )}

        {messages.map((msg) => (
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
