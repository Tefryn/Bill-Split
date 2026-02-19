"use client";

import { useParams } from 'next/navigation'
import { useState, useEffect } from "react";
import { Header } from "@/components/organisms/header";
import { ItemDisplay } from "@/components/molecules/ItemDisplay";

interface Item {
    id: number;
    name: string;
    cost: number;
    shareable: boolean;
    claimedBy: string[];
}

interface UserProps {
    email: string;
    total_cost: number;
}

interface Session {
    id: number;
    items: Item[];
    users: UserProps[];
    members: string[];
    tax: number;
    tip: number;
}

export default function SessionView() {
    const [userTotal, setUserTotal] = useState<number>(0);
    const [session, setSession] = useState<Session>();
    const API_URL = "http://localhost:8080";
    const { id } = useParams(); // make context?
    const userEmail  = "eiko.reisz@gmail.com" // Hardcoded: make context

    console.log('result');

    const itemTotal = () => {
        return session?.items.reduce((acc, item) => acc + item.cost, 0) || 0;
    };

    const taxAmount = () => {
        return itemTotal() * ((session?.tax || 0) / 100);
    };

    const tipAmount = () => {
        return itemTotal() * ((session?.tip || 0) / 100);
    };

    const fetchSession = async () => {
        const query = `
            query FetchSession($sessionId: ID!) {
                fetchSession(sessionId: $sessionId){
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
        
        try {
            const response = await fetch(`${API_URL}/graphql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    query: query,
                    variables: { 
                        sessionId: id
                    }, 
                }),
            });

            const result = await response.json();
            console.log(result.data?.claimItem);

            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
            } else if (result.data?.fetchSession) {
                return result.data.fetchSession;
                // Set user total?
            } else {
                console.error("Error: Failed to fetch session.");
            }
        } catch (err) {
            console.error("Network error occurred.", err);
        }
    }

    useEffect(() => {
        const loadSession = async () => {
            if (id) {
                setSession(await fetchSession());
            }
        };
        loadSession();
    }, [id]);
    
    const handleClaim = async (itemId: number, userEmail: string) => {
        const mutation = `
            mutation ClaimItem($sessionId: ID!, $itemId: ID!, $userEmail: String!) {
                claimItem(sessionId: $sessionId, itemId: $itemId, userEmail: $userEmail)
            }
        `;

        try {
            const response = await fetch(`${API_URL}/graphql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    query: mutation,
                    variables: { 
                        sessionId: id,
                        itemId: itemId,
                        userEmail: userEmail
                    }, 
                }),
            });

            const result = await response.json();

            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
            } else if (result.data?.claimItem != null && result.data.claimItem != -1) {
                console.log(result.data.claimItem)
                setUserTotal(result.data.claimItem);
                return true;
            } else {
                console.error("Error: Failed to claim item.");
            }
        } catch (err) {
            console.error("Network error occurred.", err);
        }
        return false;
    }

    const handleUnclaim = async (itemId: number, userEmail: string) => {
        const mutation = `
            mutation UnclaimItem($sessionId: ID!, $itemId: ID!, $userEmail: String!) {
                unclaimItem(sessionId: $sessionId, itemId: $itemId, userEmail: $userEmail)
            }
        `;

        try {
            const response = await fetch(`${API_URL}/graphql`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ 
                    query: mutation,
                    variables: { 
                        sessionId: id,
                        itemId: itemId,
                        userEmail: userEmail
                    }, 
                }),
            });

            const result = await response.json();
            console.log(result.data?.unclaimItem);

            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
            } else if (result.data?.unclaimItem != null && result.data.unclaimItem != -1) {
                console.log(result.data.unclaimItem)
                setUserTotal(result.data.unclaimItem);
                return true;
            } else {
                console.error("Error: Failed to unclaim item.");
            }
        } catch (err) {
            console.error("Network error occurred.", err);
        }
        return false;
    }


    if (!session) {
        return (
            <main className="max-w-2xl mx-auto p-6">
                <Header 
                    title="Loading..." 
                    subtitle=""
                    showBackButton 
                    backHref="/" 
                />
            </main>
        );
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
        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Session ID: {session.id}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Welcome, {userEmail}</h2>
            <h2 className="text-lg font-semibold mb-4 text-black">Your Total: ${userTotal.toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Items: ${itemTotal().toFixed(2)}</h2>
            <ul className="space-y-2">
                {session.items.map((item) => (
                    <ItemDisplay
                        key={item.id}
                        item={item}
                        onClaim={() => handleClaim(item.id, userEmail)}
                        onUnclaim={() => handleUnclaim(item.id, userEmail)}
                        isClaimed={item.claimedBy.includes(userEmail)}
                        disabled={!userEmail}
                    />
                ))}
            </ul>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tax: {session.tax}% - ${taxAmount().toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tip: {session.tip}% - ${tipAmount().toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Total: ${(itemTotal()+taxAmount()+tipAmount()).toFixed(2)}</h2>
        </div>

        <div>
            <button 
                onClick = {() => console.log(JSON.stringify(session))}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]"
            >
                check session (debug)
            </button>
        </div>
      </section>
    </main>
  );
}