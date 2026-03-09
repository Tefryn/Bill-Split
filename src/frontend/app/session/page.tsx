"use client";

import { useUser } from "@/components/molecules/userContext";
import { useRouter } from "next/navigation";
import { useState, useEffect, useCallback } from "react";
import { Header } from "@/components/organisms/header";
import { ItemDisplay } from "@/components/molecules/itemDisplay";
import User from "@/types/user";
import Item from "@/types/item";
import Session from "@/types/session";
import { Client } from "@stomp/stompjs";

export default function SessionView() {
    const [userTotal, setUserTotal] = useState<number>(0);
    const [session, setSession] = useState<Session>();
    const [isLoading, setIsLoading] = useState<boolean>();
    const [errMessage, setErrMessage] = useState<string>("");
    const API_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_IP}:${process.env.NEXT_PUBLIC_BACKEND_PORT}` || "http://localhost:8080";
    const { setUser } = useUser();
    const { email: userEmail, sessionId: sessionId } = useUser();

    const router = useRouter();

    const itemTotal = () => {
        return session?.items.reduce((acc: number, item: Item) => acc + parseFloat(item.cost), 0) || 0;
    };

    const taxAmount = () => {
        const total = itemTotal();
        if (total == 0) {
            return 0;
        }
        return userTotal / itemTotal() * (session?.tax || 0);
    };

    const tipAmount = () => {
        const total = itemTotal();
        if (total == 0) {
            return 0;
        }
        return userTotal / itemTotal() * (session?.tip || 0);
    };

    const fetchSession = useCallback(async () => {
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
                        shareable
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
                        sessionId: sessionId
                    }, 
                }),
            });

            const result = await response.json();

            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
            } else if (result.data?.fetchSession) {
                return result.data.fetchSession;
            } else {
                console.error("Error: Failed to fetch session.");
            }
        } catch (err) {
            console.error("Network error occurred.", err);
        }
        setErrMessage("Failed to fetch Session.");
    }, [sessionId]);

    useEffect(() => {
        const loadSession = async () => {
            if (sessionId) {
                const currentSession = await fetchSession();
                setSession(currentSession);

                const currentUser = currentSession?.users.find((user: User) => user.email === userEmail);

                if (currentUser) {
                    setUserTotal(parseFloat(currentUser.total_cost));
                }
            }
        };
        loadSession();
    }, [sessionId, fetchSession, userEmail]);

    useEffect(() => {
        const client = new Client({
        brokerURL: `ws://${process.env.NEXT_PUBLIC_BACKEND_IP}:${process.env.NEXT_PUBLIC_BACKEND_PORT}/ws`,
        onConnect: () => {
            client.subscribe("/topic/session/" + sessionId + "/cost_update/" + userEmail, (message) => {
                const newCost = message.body;
                console.log("Received message:", message.body);
                setUserTotal(parseFloat(newCost));
            });
            client.subscribe("/topic/session/" + sessionId + "/new_claim", (message) => {
                const claimInfo = message.body;
                console.log("Received message:", message.body);
                const [itemId, claimer] = claimInfo.split("::");
                setSession((prevSession) => {
                if (!prevSession) return prevSession;
                const updatedItems = prevSession.items.map((item) => {
                    if ((item.id).toString() === itemId && !item.claimedBy.includes(claimer)) {
                        return { ...item, claimedBy: [...item.claimedBy, claimer] };
                    }
                    return item;
                });
                return { ...prevSession, items: updatedItems };
            });
            });
            client.subscribe("/topic/session/" + sessionId + "/new_unclaim", (message) => {
                const unclaimInfo = message.body;
                console.log("Received message:", message.body);
                const [itemId, unclaimer] = unclaimInfo.split("::");
                setSession((prevSession) => {
                    if (!prevSession) return prevSession;
                    const updatedItems = prevSession.items.map((item) => {
                        if ((item.id).toString() === itemId) {
                            return { ...item, claimedBy: item.claimedBy.filter((email) => email !== unclaimer) };
                        }
                        return item;
                    });
                    return { ...prevSession, items: updatedItems };
                });
            });
        },
        onStompError: (frame) => {
            console.error("STOMP error:", frame);
        },
        });

        

        client.activate();
        return () => {
        client.deactivate();
        };
    }, [sessionId, userEmail]);
    
    const handleClaim = async (item: Item) => {
        console.log('claim');
        if(isLoading) {
            return false;
        }

        setIsLoading(true);
        // optimistic ui
        const oldUserTotal = userTotal
        // if the user's already in the claimedBy list, then item.cost is accurate
        // otherwise, undo split and resplit with one extra person
        let costUpdate: number;
        const itemCost = parseFloat(item.cost);
        if (item.claimedBy.length === 0)
        { costUpdate = itemCost; }
        else if (item.claimedBy.includes(userEmail)) 
        { costUpdate = itemCost / (item.claimedBy.length); }
        else
        { costUpdate = itemCost / (item.claimedBy.length + 1); }

        setUserTotal(oldUserTotal + costUpdate);

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
                        sessionId: sessionId,
                        itemId: item.id,
                        userEmail: userEmail
                    }, 
                }),
            });
            const result = await response.json();

            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
            } else if (result.data?.claimItem != false) {
                setIsLoading(false);
                return true;
            }
        } catch (err) {
            console.error("Network error occurred.", err);
        }
        setErrMessage("Failed to claim item. Please try again.");
        setTimeout(() => setErrMessage(""), 3000)
        setUserTotal(oldUserTotal); // revert ui
        setIsLoading(false);
        return false;
    }

    const handleUnclaim = async (item: Item) => {
        console.log('unclaim');
        if(isLoading) {
            return false; 
        }

        setIsLoading(true);
        // optimistic ui
        const oldUserTotal = userTotal
        // if the user's already in the claimedBy list, then item.cost is accurate
        // otherwise, undo split and resplit with one extra person

        let costUpdate: number;
        const itemCost = parseFloat(item.cost);
        if (item.claimedBy.length === 0)
        { costUpdate = itemCost; }
        else if (item.claimedBy.includes(userEmail)) 
        { costUpdate = itemCost / (item.claimedBy.length); }
        else
        { costUpdate = itemCost / (item.claimedBy.length + 1); }

        setUserTotal(oldUserTotal - costUpdate);

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
                        sessionId: sessionId,
                        itemId: item.id,
                        userEmail: userEmail
                    }, 
                }),
            });

            const result = await response.json();
            console.log(result.data?.unclaimItem);

            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
            } else if (result.data?.unclaimItem != false) {
                setIsLoading(false);
                return true;
            }
        } catch (err) {
            console.error("Network error occurred.", err);
        }
        setErrMessage("Failed to unclaim item. Please try again.");
        setTimeout(() => setErrMessage(""), 3000)
        setUserTotal(oldUserTotal); // revert ui
        setIsLoading(false);
        return false;
    }

    const handleLogOut = () => {
        setUser("", "");
        router.push(`/`);
    }

    if (!session) {
        return (
            <main className="max-w-2xl mx-auto p-6">
                <Header 
                    title="Session View" 
                    subtitle=""
                    showBackButton 
                    backHref="/" 
                />
                <section className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
                <div>
                    <h2 className="text-lg font-semibold mb-4 text-black">Session ID: ...</h2>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4 text-black">Welcome ...</h2>
                    <h2 className="text-lg font-semibold mb-4 text-black">Your Total: ...</h2>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4 text-black">Items: ...</h2>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4 text-black">Tax: ...</h2>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4 text-black">Tip: ...</h2>
                </div>

                <div>
                    <h2 className="text-lg font-semibold mb-4 text-black">Total: ...</h2>
                </div>
            </section>
            </main>
        );
    }

    return (
    <main className="max-w-2xl mx-auto p-6">
      <Header 
        title="Session View" 
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
              <h2 className="text-lg font-semibold mb-4 text-black">Your Total: ${(Number(userTotal)+taxAmount()+tipAmount()).toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Items: ${itemTotal().toFixed(2)}</h2>
            <h2 className="text-lg font-semibold mb-4 text-red-600">{errMessage}</h2>
            <ul className="space-y-2">
                {session.items.map((item) => (
                    <ItemDisplay
                        key={item.id}
                        item={item}
                        onClaim={() => handleClaim(item)}
                        onUnclaim={() => handleUnclaim(item)}
                        isClaimed={item.claimedBy.includes(userEmail)}
                        disabled={!item.shareable && item.claimedBy.length > 0 && !item.claimedBy.includes(userEmail)}
                    />
                ))}
            </ul>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tax: - ${Number(session?.tax || 0).toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Tip: - ${Number(session?.tip || 0).toFixed(2)}</h2>
        </div>

        <div>
            <h2 className="text-lg font-semibold mb-4 text-black">Total: ${(itemTotal()+Number(session?.tip || 0) + Number(session?.tax||0)).toFixed(2)}</h2>
        </div>

        <div>
            <button 
                onClick = {handleLogOut}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]"
            >
                Log Out
            </button>
        </div>

        {/* <div>
            <button 
                onClick = {() => console.log(JSON.stringify(session))}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]"
            >
                check session (debug)
            </button>
        </div> */}
      </section>
    </main>
  );
}