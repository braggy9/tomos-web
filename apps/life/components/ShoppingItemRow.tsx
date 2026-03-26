"use client";

interface ShoppingItemRowProps {
  id: string;
  name: string;
  quantity: string | null;
  checked: boolean;
  onCheck: (id: string, checked: boolean) => void;
  onDelete: (id: string) => void;
}

export function ShoppingItemRow({ id, name, quantity, checked, onCheck, onDelete }: ShoppingItemRowProps) {
  return (
    <div className="flex items-center gap-3 px-3 py-2.5 rounded-lg bg-white border border-gray-100 group">
      <button
        onClick={() => onCheck(id, !checked)}
        className={`w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${
          checked
            ? "bg-brand-600 border-brand-600 text-white"
            : "border-gray-300 hover:border-brand-400"
        }`}
      >
        {checked && (
          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" strokeWidth={3} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
          </svg>
        )}
      </button>
      <span className={`flex-1 text-sm ${checked ? "text-gray-400 line-through" : "text-gray-800"}`}>
        {name}
      </span>
      {quantity && (
        <span className="text-xs text-gray-400">{quantity}</span>
      )}
      <button
        onClick={() => onDelete(id)}
        className="opacity-0 group-hover:opacity-100 text-gray-300 hover:text-red-400 transition-all"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
        </svg>
      </button>
    </div>
  );
}
