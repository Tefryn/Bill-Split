"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Header } from "@/components/organisms/header";
import { Input } from "@/components/atoms/input";
import { ItemEntry } from "@/components/molecules/item-entry";

export default function CreateGroupPage() {
    const searchParams = useSearchParams();
    const initialName = searchParams.get("name") || "";
    const [groupName, setGroupName] = useState(initialName);
    const [items, setItems] = useState([]);
    const [members, setMembers] = useState([]);

    interface ItemEntryProps {
        onAdd: (item: { name: string; cost: number }) => void;
    }

    return (
    <main className="max-w-2xl mx-auto p-6">
      <Header 
        title="Create Group" 
        subtitle=""
        showBackButton 
        backHref="/" 
      />

      <section className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Group Name
          </label>
          <Input 
            value={groupName} 
            onChange={setGroupName} 
            placeholder="What are we splitting?"
          />
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700">
          Create Group
        </button>
      </section>
    </main>
  );
}