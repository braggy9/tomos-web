"use client";

import { useQuery } from "@tanstack/react-query";

const API = "https://tomos-task-api.vercel.app";

export interface Matter {
  id: string;
  title: string;
  client: string;
  type: string;
  status: string;
  priority: string;
  lastActivityAt: string;
}

async function fetchMatters(): Promise<Matter[]> {
  const res = await fetch(`${API}/api/matters?status=active&limit=10`);
  if (!res.ok) throw new Error("Failed to fetch matters");
  const data = await res.json();
  return data.data || [];
}

export function useMatters() {
  return useQuery({
    queryKey: ["matters-active"],
    queryFn: fetchMatters,
    staleTime: 5 * 60 * 1000,
  });
}
