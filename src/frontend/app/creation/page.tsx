"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/organisms/header";
import { Input } from "@/components/atoms/input";
import { ItemEntry } from "@/components/molecules/item-entry";
import { useUser } from "@/components/molecules/UserContext";

interface ItemProps {
    name: string;
    cost: number;
    shareable: boolean;
}

export default function CreateSessionPage() {
    const { setUser } = useUser();
    const [sessionName, setSessionName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tax, setTax] = useState("");
    const [tip, setTip] = useState("");
    const [items, setItems] = useState<ItemProps[]>([]);
    const API_URL = "http://localhost:8080";

    const router = useRouter();
    
    const handleCreation = async (e: React.FormEvent) => {
        if(isLoading) {
            return
        }
        e.preventDefault();

        const mutation = `
            mutation CreateSession($input: CreateSessionInput!) {
                createSession(input: $input) {
                    id
                    name
                    items {
                        id
                        name
                        cost
                        claimedBy
                    }
                    users {
                        email 
                        total_cost
                    }
                    tip
                    tax
                }
            }
        `;

        const sessionInput = {
            name: sessionName,
            items: items.map(item => ({
                name: item.name,
                cost: item.cost,
                shareable: item.shareable,
                claimedBy: [],
            })),
            users: [{ email: userEmail, total_cost: 0 }],
            tax: parseFloat(tax) || 0,
            tip: parseFloat(tip) || 0,
        };
            
        try {
            setIsLoading(true);
            const response = await fetch(`${API_URL}/graphql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    query: mutation,
                    variables: { 
                        input: sessionInput
                    }, 
                }),
            });
            
            const result = await response.json();
            console.log(result)
            
            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
            } else if (result.data?.createSession) {
                setUser(userEmail, result.data.createSession.id);
                router.push(`/session`);
            } else {
                console.error("Error: Failed to create session.");
            }
        } catch (err) {
            console.error("Network error occurred.", err);
        }
        setIsLoading(false);
    };

    const addItem = (name: string, cost: number, shareable: boolean) => {
        const newItem = {name, cost, shareable};
        setItems([newItem, ...items]);
    }

    
    const itemTotal = () => {
        return items.reduce((total, item) => total + item.cost, 0);
    }

    const taxAmount = () => { // TODO: Should be amount not percent
        const taxValue = parseFloat(tax);
        if (isNaN(taxValue)) {
            return 0;
        }
        return itemTotal() * (parseFloat(tax) / 100);
    }

    const tipAmount = () => { // TODO: Add a toggle to swap between amount or percent
        const tipValue = parseFloat(tax);
        if (isNaN(tipValue)) {
            return 0;
        }
        return itemTotal() * (parseFloat(tip) / 100);
    }

    return (
    <main className="max-w-2xl mx-auto p-6">
      <Header 
        title="Create Session" 
        subtitle=""
        showBackButton 
        backHref="/" 
      />

      <section className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
        {/* Session Name Entry */}
        <div>
          <label className="block text-sm font-medium mb-2 text-gray-700">
            Session Name
          </label>
          <Input 
            value={sessionName} 
            onChange={setSessionName} 
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

        {/* Email Entry */}
        <div>
            <label className="block text-sm font-medium mb-2 text-gray-700">
                Your Email:
            </label>
            <Input
                type="text"
                value={userEmail}
                onChange={setUserEmail}
                placeholder="Enter your email"
            />
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
            <h2 className="text-lg font-semibold mb-4 text-black">Session Name: {sessionName}</h2>
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
            <h2 className="text-lg font-semibold mb-4 text-black">Your Email: {userEmail}</h2>
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

        <button 
        onClick={handleCreation}
        className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700">
          Create Session
        </button>
      </section>
    </main>
  );
}