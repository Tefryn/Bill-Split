"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Header } from "@/components/organisms/header";
import { Input } from "@/components/atoms/input";
import { ItemEntry } from "@/components/molecules/item-entry";
import { MemberEntry } from "@/components/molecules/member-entry";

interface ItemProps {
    name: string;
    cost: number;
}

interface MemberProps {
    name: string;
}

export default function CreateGroupPage() {
    const searchParams = useSearchParams();
    const initialName = searchParams.get("name") || "";
    const [groupName, setGroupName] = useState(initialName);
    const [tax, setTax] = useState("");
    const [tip, setTip] = useState("");
    const [items, setItems] = useState<ItemProps[]>([]);
    const [members, setMembers] = useState<MemberProps[]>([]);

    const addItem = (name: string, cost: number) => {
        const newItem = {name, cost};
        setItems([newItem, ...items]);
    }
    const addMember = (name: string) => {
        const newMember = {name};
        setMembers([newMember, ...members]);
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
        {/* Group Name Entry */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Group Name
          </label>
          <Input 
            value={groupName} 
            onChange={setGroupName} 
            placeholder=""
          />
        </div>

        {/* Item Entry */}
        <div>
            <ItemEntry addItem={addItem}></ItemEntry>
        </div>

        {/* Member Entry */}
        <div>
            <MemberEntry addMember={addMember}></MemberEntry>
        </div>

        { /* Tax Entry */ }
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Tax
          </label>
          <Input 
            type='number'
            value={tax} 
            onChange={setTax} 
            placeholder="in percentage, e.g. 10 or 20"
          />
        </div>

        { /* Tip Entry */ }
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Tip
          </label>
          <Input 
            type="number"
            value={tip} 
            onChange={setTip} 
            placeholder="in percentage, e.g. 10 or 20"
          />
        </div>


        { /* Confirmation Display */ }
        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Group Name: {groupName}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Items</h2>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex justify-between text-black items-center bg-black-50 p-3 rounded-md border">
                        <span>{item.name}</span>
                        <span className="text-sm font-medium">${item.cost.toFixed(2)}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Members</h2>
            <ul className="space-y-2">
                {members.map((member, index) => (
                    <li key={index} className="flex justify-between text-black items-center bg-black-50 p-3 rounded-md border">
                        <span>{member.name}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tax: {tax}%</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tip: {tip}%</h2>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700">
          Create Group
        </button>
      </section>
    </main>
  );
}