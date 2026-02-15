"use client";

import { Input } from "@/components/atoms/input";
import { useState } from "react";

interface ItemEntryProps {
  addItem: (name: string, cost: number, shareable: boolean) => void;
}

export function ItemEntry({ addItem }: ItemEntryProps) {
  const [name, setName] = useState("");
  const [cost, setCost] = useState("");
  const [shareable, setShareable] = useState(false);

  const handleAdd = () => {
    const numericCost = parseFloat(cost);
    if (name && !isNaN(numericCost)) {
      addItem(name, numericCost, shareable);
      setName("");
    }
    else if (name && isNaN(numericCost)) {
      alert("Please enter a valid number for cost.");
    }
    setCost("");

  };

  return (
    <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
      <div className="flex-1">
        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Item Name</label>
        <Input 
          value={name} 
          onChange={setName} 
          placeholder="e.g. Pizza" 
        />
      </div>
      <div className="w-32">
        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Cost ($)</label>
        <Input 
          value={cost} 
          onChange={setCost} 
          placeholder="0.00" 
        />
      </div>
      <div className="w-32">
        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Shareable?</label>
        <button
          onClick={() => setShareable(!shareable)}
          className={`w-full py-2 rounded-md transition-colors ${shareable ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
        >
          {shareable ? "Yes" : "No"}
        </button>
      </div>
      <button
        onClick={handleAdd}
        disabled={!name || !cost}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]"
      >
        Add
      </button>
    </div>
  );
}