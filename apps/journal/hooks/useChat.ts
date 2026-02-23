"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { journal } from "@tomos/api";

export function useConversations() {
  return useQuery({
    queryKey: ["journal-conversations"],
    queryFn: () => journal.getConversations(),
    select: (res) => res.data,
  });
}

export function useConversation(conversationId: string) {
  return useQuery({
    queryKey: ["journal-conversation", conversationId],
    queryFn: () => journal.getConversation(conversationId),
    select: (res) => res.data,
    enabled: !!conversationId,
  });
}

export function useSendMessage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: {
      message: string;
      conversationId?: string;
      entryId?: string;
      mode?: string;
    }) => journal.sendMessage(data),
    onSuccess: (res) => {
      const convId = res.data.conversationId;
      queryClient.invalidateQueries({ queryKey: ["journal-conversation", convId] });
      queryClient.invalidateQueries({ queryKey: ["journal-conversations"] });
    },
  });
}
