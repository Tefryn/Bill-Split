"use client";

import { useSearchParams } from "next/navigation";
import { useState, useEffect } from "react";
import { Header } from "@/components/organisms/header";
import { Input } from "@/components/atoms/input";
import { ItemEntry } from "@/components/molecules/item-entry";
import { MemberEntry } from "@/components/molecules/member-entry";
import { json } from "stream/consumers";

interface ItemProps {
    name: string;
    cost: number;
    shareable: boolean;
}

interface MemberProps {
    name: string;
}

export default function GroupView() {
    const [user, setUser] = useState("");
    const [status, setStatus] = useState("");

    // hard coded initial state for testing purposes
    const testGroup = {
        groupName: "supercalli",
        items: [
            {name: "Fries", cost: 5.00, shareable: true, claimedBy: []}, 
            {name: "Fish", cost: 20.00, shareable: false, claimedBy: []}, 
            {name: "Burger", cost: 5.00, shareable: false, claimedBy: []}, 
            {name: "Pizza", cost: 10.00, shareable: false, claimedBy: []}],
        members: ["Daniel", "Eikos", "Connor"],
        tax: 5,
        tip: 10
    }

    let groupInView = testGroup;

    // handleClaim
    // get the item named and user name
    // check if item is shareable
    // if shareable, add user to claimedBy array
    // if not shareable, check if claimedBy is empty

    const handleClaim = (name: string) => {
        const itemName = name;
        const userName = user;
        setStatus(itemName);
    }

    const itemTotal = () => {
        return groupInView.items.reduce((total, item) => total + item.cost, 0);
    }

    const taxAmount = () => {
        return itemTotal() * (groupInView.tax / 100);
    }

    const tipAmount = () => {
        return itemTotal() * (groupInView.tax / 100);
    }

    return (
    <main className="max-w-2xl mx-auto p-6">
      <Header 
        title="Group View" 
        subtitle=""
        showBackButton 
        backHref="/" 
      />

      <section className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        { /* Confirmation Display */ }
        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Group Name: {groupInView.groupName}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Items: ${itemTotal().toFixed(2)}</h2>
            <h2 className="text-lg font-semibold mb-4 text-black">Claim: {status !== "" ? status + " already claimed" : ""}</h2>
            <ul className="space-y-2">
                {groupInView.items.map((item, index) => (
                    <button 
                        onClick = {() => handleClaim(item.name)}
                        key={index}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]"
                    >
                        {item.name} - ${item.cost.toFixed(2)}
                    </button>
                ))}
            </ul>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">{ user == "" ? "Who are you?" : user + "'s total: "}</h2>
            <ul className="space-y-2">
                {groupInView.members.map((member, index) => (
                    <button 
                        onClick = {() => setUser(member)}
                        key={index}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]"
                    >
                        {member}
                    </button>
                ))}
            </ul>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tax: {groupInView.tax}% - ${taxAmount().toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tip: {groupInView.tip}% - ${tipAmount().toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Total: ${(itemTotal()+taxAmount()+tipAmount()).toFixed(2)}</h2>
        </div>

        <div>
            <button 
                onClick = {() => console.log(JSON.stringify(groupInView))}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]"
            >
                check group
            </button>
        </div>
      </section>
    </main>
  );
}