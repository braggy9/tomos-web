"use client";

import { useState } from "react";
import {
  useShopping,
  useAddShoppingItem,
  useCheckShoppingItem,
  useDeleteShoppingItem,
  useClearChecked,
  useParseShoppingText,
} from "../../hooks/useShopping";
import { ShoppingItemRow } from "../../components/ShoppingItemRow";
import { Spinner } from "@tomos/ui";
import { useToast } from "@tomos/ui";
import type { ShoppingCategory } from "@tomos/api";

const categoryOrder: ShoppingCategory[] = ["produce", "dairy", "meat", "pantry", "household", "other"];
const categoryLabels: Record<string, string> = {
  produce: "Produce",
  dairy: "Dairy",
  meat: "Meat & Fish",
  pantry: "Pantry",
  household: "Household",
  other: "Other",
};

export default function ShopPage() {
  const { data: items, isLoading } = useShopping();
  const addItem = useAddShoppingItem();
  const checkItem = useCheckShoppingItem();
  const deleteItem = useDeleteShoppingItem();
  const clearChecked = useClearChecked();
  const parseText = useParseShoppingText();
  const { toast } = useToast();

  const [input, setInput] = useState("");
  const [aiMode, setAiMode] = useState(false);

  function handleAdd() {
    const text = input.trim();
    if (!text) return;

    if (aiMode) {
      parseText.mutate(text, {
        onSuccess: (res) => {
          setInput("");
          toast(`Added ${res.data.length} items`);
        },
        onError: () => toast("Failed to parse items", "error"),
      });
    } else {
      addItem.mutate(
        { name: text },
        {
          onSuccess: () => {
            setInput("");
          },
          onError: () => toast("Failed to add item", "error"),
        }
      );
    }
  }

  function handleCheck(id: string, checked: boolean) {
    checkItem.mutate({ id, checked });
  }

  function handleDelete(id: string) {
    deleteItem.mutate(id);
  }

  function handleClear() {
    clearChecked.mutate(undefined, {
      onSuccess: (res) => toast(`Cleared ${res.data.deleted} items`),
    });
  }

  if (isLoading) {
    return (
      <div className="flex justify-center py-20">
        <Spinner />
      </div>
    );
  }

  const unchecked = items?.filter((i) => !i.checked) || [];
  const checked = items?.filter((i) => i.checked) || [];

  // Group unchecked by category
  const grouped: Record<string, typeof unchecked> = {};
  for (const item of unchecked) {
    const cat = item.category || "other";
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Shopping</h1>
          <p className="text-sm text-gray-500">{unchecked.length} items to buy</p>
        </div>
        {checked.length > 0 && (
          <button
            onClick={handleClear}
            disabled={clearChecked.isPending}
            className="px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:bg-red-50 transition-colors"
          >
            Clear checked ({checked.length})
          </button>
        )}
      </div>

      {/* Quick add */}
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={aiMode ? "milk, 2kg chicken, bananas..." : "Add item..."}
          className="flex-1 px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
          onKeyDown={(e) => e.key === "Enter" && handleAdd()}
        />
        <button
          onClick={() => setAiMode(!aiMode)}
          className={`px-2.5 py-2 rounded-lg text-xs font-medium transition-colors ${
            aiMode ? "bg-brand-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
          }`}
          title={aiMode ? "AI parse mode" : "Single item mode"}
        >
          AI
        </button>
        <button
          onClick={handleAdd}
          disabled={!input.trim() || addItem.isPending || parseText.isPending}
          className="px-4 py-2 rounded-lg bg-brand-600 text-white text-sm font-medium hover:bg-brand-700 disabled:opacity-50 transition-colors"
        >
          Add
        </button>
      </div>

      {/* Items grouped by category */}
      {categoryOrder.map((cat) => {
        const catItems = grouped[cat];
        if (!catItems || catItems.length === 0) return null;
        return (
          <section key={cat}>
            <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
              {categoryLabels[cat]}
            </h2>
            <div className="space-y-1.5">
              {catItems.map((item) => (
                <ShoppingItemRow
                  key={item.id}
                  id={item.id}
                  name={item.name}
                  quantity={item.quantity}
                  checked={item.checked}
                  onCheck={handleCheck}
                  onDelete={handleDelete}
                />
              ))}
            </div>
          </section>
        );
      })}

      {/* Checked items */}
      {checked.length > 0 && (
        <section>
          <h2 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Checked off
          </h2>
          <div className="space-y-1.5 opacity-60">
            {checked.map((item) => (
              <ShoppingItemRow
                key={item.id}
                id={item.id}
                name={item.name}
                quantity={item.quantity}
                checked={item.checked}
                onCheck={handleCheck}
                onDelete={handleDelete}
              />
            ))}
          </div>
        </section>
      )}

      {/* Empty state */}
      {unchecked.length === 0 && checked.length === 0 && (
        <div className="text-center py-16">
          <p className="text-4xl mb-3">{"\uD83D\uDED2"}</p>
          <p className="text-gray-500 text-sm">Shopping list is empty</p>
          <p className="text-gray-400 text-xs mt-1">Add items above or use AI mode for natural language</p>
        </div>
      )}
    </div>
  );
}
