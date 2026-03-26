import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { life } from "@tomos/api";
import type { CreateShoppingItemRequest, UpdateShoppingItemRequest } from "@tomos/api";

export function useShopping(params?: { checked?: boolean; category?: string }) {
  return useQuery({
    queryKey: ["life", "shopping", params],
    queryFn: () => life.getShoppingItems(params),
    select: (res) => res.data,
  });
}

export function useAddShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CreateShoppingItemRequest) => life.addShoppingItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "shopping"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useUpdateShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateShoppingItemRequest }) =>
      life.updateShoppingItem(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "shopping"] });
    },
  });
}

export function useDeleteShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => life.deleteShoppingItem(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "shopping"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useCheckShoppingItem() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { id: string; checked: boolean }) =>
      life.checkShoppingItem(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "shopping"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useClearChecked() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => life.clearCheckedItems(),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "shopping"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}

export function useParseShoppingText() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (text: string) => life.parseShoppingText(text),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["life", "shopping"] });
      qc.invalidateQueries({ queryKey: ["life", "today"] });
    },
  });
}
