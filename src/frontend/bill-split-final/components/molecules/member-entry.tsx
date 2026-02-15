"use client";

import { Input } from "@/components/atoms/input";
import { useState } from "react";

interface MemberEntryProps {
  addMember: (name: string) => void;
}

export function MemberEntry({ addMember }: MemberEntryProps) {
  const [name, setName] = useState("");

  const handleAdd = () => {
    if (name) {
      addMember(name);
      // Reset fields after adding
      setName("");
    }
  };

  return (
    <div className="flex gap-4 items-end bg-gray-50 p-4 rounded-lg border border-dashed border-gray-300">
      <div className="flex-1">
        <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Member Name</label>
        <Input 
          value={name} 
          onChange={setName} 
          placeholder="e.g. Daniel" 
        />
      </div>
      <button
        onClick={handleAdd}
        disabled={!name}
        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]"
      >
        Add
      </button>
    </div>
  );
}