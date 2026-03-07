"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/organisms/header";
import { Input } from "@/components/atoms/input";
import { ItemEntry } from "@/components/molecules/itemEntry";
import { ItemEditor } from "@/components/molecules/itemEditor";
import { useUser } from "@/components/molecules/userContext";

interface ItemProps {
    name: string;
    cost: number;
    shareable: boolean;
}

export default function CreateSessionPage() {
    // hard coded items for testing
    // these items would be parsed from whatever the backend returns
    const parsedItems: ItemProps[] = [
        { name: "Pizza", cost: 20.00, shareable: true },
        { name: "Pasta", cost: 15.00, shareable: false },
    ];

    const { setUser } = useUser();
    const [errMessage, setErrMessage] = useState("");
    const [sessionName, setSessionName] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [tax, setTax] = useState("");
    const [tip, setTip] = useState("");
    const [isPercent, setIsPercent] = useState(false);
    const [items, setItems] = useState<ItemProps[]>(parsedItems);
    const API_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_IP}:${process.env.NEXT_PUBLIC_BACKEND_PORT}` || "http://localhost:8080";

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
                cost: String(item.cost),
                shareable: item.shareable,
                claimedBy: [],
            })),
            users: [{ email: userEmail, total_cost: "0.00" }],
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
            
            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
            } else if (result.data?.createSession) {
                setUser(userEmail, result.data.createSession.id);
                router.push(`/session`);
            } else {
                setErrMessage("Failed to create session.");
                setTimeout(() => setErrMessage(""), 3000);
            }
        } catch (err) {
            console.error("Network error occurred.", err);
        }
        setIsLoading(false);
    };

    const handleEditItem = (index: number, name: string, cost: number, shareable: boolean) => {
        console.log(`Editing item at index ${index} with new values: ${name}, ${cost}, ${shareable}`);
        if (name === "" || isNaN(cost) || cost < 0) {
            setErrMessage("Invalid item details. Please check your inputs.");
            setTimeout(() => setErrMessage(""), 3000);
            return;
        }
        setItems(items.map((item, i) => i === index ? { name, cost, shareable } : item));
    }

    const handleDeleteItem = (index: number) => {
        setItems(items.filter((_, i) => i !== index));
    }

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
        return taxValue;
    }

    const tipAmount = () => { // TODO: Add a toggle to swap between amount or percent
        const tipValue = parseFloat(tip);
        if (isNaN(tipValue)) {
            return 0;
        }
        if (!isPercent) {
            return tipValue;
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

        <h2 className="text-lg font-semibold mb-4 text-red-600">{errMessage}</h2>

        {/* Item Display */}
        <div>
            <ul className="space-y-2">
                {items.map((item, index) => (
                    <ItemEditor 
                        key={index}
                        id={index}
                        name={item.name} 
                        cost={(item.cost).toString()} 
                        shareable={item.shareable} 
                        onEdit={handleEditItem}
                        onDelete={handleDeleteItem}>    
                    </ItemEditor>
                ))}
            </ul>
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

        <div className = "flex gap-4">
            { /* Tax Entry */ }
            <div className ="flex-3">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tax
                </label>
                <Input 
                    type='number'
                    value={tax} 
                    onChange={setTax} 
                    placeholder="in $"
                />
            </div>
            { /* Tip Entry */ }
            <div className="flex-3">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tip
                </label>
                <Input 
                    type="number"
                    value={tip} 
                    onChange={setTip} 
                    placeholder="in $ or %"
                />
            </div>
            { /* Tip Switch */ }
            <div className="flex-2">
                <label className="block text-sm font-medium mb-2 text-gray-700">
                    Tip in $ or %?
                </label>
                <button
                    onClick={() => setIsPercent(!isPercent)}
                    className={`w-full py-2 rounded-md transition-colors ${isPercent ? 'bg-blue-600 text-white hover:bg-blue-700' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                    {isPercent ? "Percentage" : "Dollar Amount"}
                </button>
            </div>
        </div>

        <hr className="border-t border-gray-900 my-8" />

        { /* Confirmation Display */ }
        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Session Name: {sessionName}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Items: ${itemTotal().toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Your Email: {userEmail}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tax: ${taxAmount().toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tip: ${tipAmount().toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Total: ${(itemTotal()+taxAmount()+tipAmount()).toFixed(2)}</h2>
        </div>

        <h2 className="text-lg font-semibold mb-4 text-red-600">{errMessage}</h2>

        <button 
        onClick={handleCreation}
        className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700">
          Create Session
        </button>
      </section>
    </main>
  );
}