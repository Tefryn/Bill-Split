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
    shareable: boolean;
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

    const addItem = (name: string, cost: number, shareable: boolean) => {
        const newItem = {name, cost, shareable};
        setItems([newItem, ...items]);
    }

    const addMember = (name: string) => {
        const newMember = {name};
        setMembers([newMember, ...members]);
    }
    
    const itemTotal = () => {
        return items.reduce((total, item) => total + item.cost, 0);
    }

    const taxAmount = () => {
        const taxValue = parseFloat(tax);
        if (isNaN(taxValue)) {
            return 0;
        }
        return itemTotal() * (parseFloat(tax) / 100);
    }

    const tipAmount = () => {
        const tipValue = parseFloat(tax);
        if (isNaN(tipValue)) {
            return 0;
        }
        return itemTotal() * (parseFloat(tip) / 100);
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
            <label className="block text-sm font-medium mb-2 text-gray-700">
                Add Items:
            </label>
            <ItemEntry addItem={addItem}></ItemEntry>
        </div>

        {/* Member Entry */}
        <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
                Add Members:
            </label>
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

        <hr className="border-t border-gray-900 my-8" />

        { /* Confirmation Display */ }
        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Group Name: {groupName}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Items: ${itemTotal().toFixed(2)}</h2>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <li key={index} className="flex justify-between text-black items-center bg-black-50 p-3 rounded-md border">
                        <span>{item.name} - {item.cost.toFixed(2)}</span>
                        <span className="text-sm font-medium">{item.shareable ? "Shared" : "Not Shared"}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Members: {members.length}</h2>
            <ul className="space-y-2">
                {members.map((member, index) => (
                    <li key={index} className="flex justify-between text-black items-center bg-black-50 p-3 rounded-md border">
                        <span>{member.name}</span>
                    </li>
                ))}
            </ul>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tax: {tax}% - ${taxAmount().toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tip: {tip}% - ${tipAmount().toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Total: ${(itemTotal()+taxAmount()+tipAmount()).toFixed(2)}</h2>
        </div>

        <button className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700">
          Create Group
        </button>
      </section>
    </main>
  );
}