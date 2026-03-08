"use client";

import { useState, useEffect, useCallback } from "react";
import { useUser } from "@/components/molecules/userContext";
import Item from "@/types/item";
import Session from "@/types/session";

`http://${process.env.NEXT_PUBLIC_BACKEND_IP}:${process.env.NEXT_PUBLIC_BACKEND_PORT}` || "http://localhost:8080";

export default function CreateFinalPage() {
    const [errMessage, setErrMessage] = useState("");
    const [session, setSession] = useState<Session | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { email: userEmail, sessionId: sessionId } = useUser();
    
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
                setIsLoading(true);
                const currentSession = await fetchSession();
                if (currentSession) {
                    setSession(currentSession);
                }
                setIsLoading(false);
            }
        };
        loadSession();
    }, [sessionId, fetchSession]);
    
    const getUserClaimedItems = (userEmail: string): Item[] => {
        if (!session) return [];
        return session.items.filter(item => 
            item.claimedBy && item.claimedBy.includes(userEmail)
        );
    };

    const calculateUserTotal = (userEmail: string): number => {
        const claimedItems = getUserClaimedItems(userEmail);
        return claimedItems.reduce((total, item) => {
            const shareCount = item.shareable ? item.claimedBy.length : 1;
            return total + (parseFloat(item.cost) / shareCount);
        }, 0);
    };

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading finalized session...</div>
            </div>
        );
    }

    if (errMessage) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="text-xl text-red-600">{errMessage}</div>
            </div>
        );
    }

    if (!session) {
        return (
            <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center">
                <div className="text-xl text-gray-600">No session data available</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white py-8 px-4">
            <div className="max-w-4xl mx-auto">
                <h1 className="text-4xl font-bold text-center text-gray-800 mb-2">
                    Finalized Bill
                </h1>

                {errMessage && (
                    <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                        {errMessage}
                    </div>
                )}

                {/* Bill Summary */}
                <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                    <h3 className="text-lg font-semibold text-gray-800 mb-4">Bill Summary</h3>
                    <div className="space-y-2 text-sm">
                        <div className="flex justify-between">
                            <span className="text-gray-600">Subtotal:</span>
                            <span className="font-medium">
                                ${session.items.reduce((sum, item) => sum + parseFloat(item.cost), 0).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tax ({session.tax}%):</span>
                            <span className="font-medium">
                                ${(session.items.reduce((sum, item) => sum + parseFloat(item.cost), 0) * session.tax / 100).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-gray-600">Tip ({session.tip}%):</span>
                            <span className="font-medium">
                                ${(session.items.reduce((sum, item) => sum + parseFloat(item.cost), 0) * session.tip / 100).toFixed(2)}
                            </span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-gray-200">
                            <span className="font-semibold text-gray-800">Total:</span>
                            <span className="font-bold text-lg">
                                ${(session.items.reduce((sum, item) => sum + parseFloat(item.cost), 0) * (1 + session.tax / 100 + session.tip / 100)).toFixed(2)}
                            </span>
                        </div>
                    </div>
                </div>

                {/* User Breakdown */}
                <div className="space-y-4">
                    <h3 className="text-2xl font-semibold text-gray-800 mb-4">User Breakdown</h3>
                    
                    {session.users.map((user) => {
                        const claimedItems = getUserClaimedItems(user.email);
                        const subtotal = calculateUserTotal(user.email);
                        const taxAmount = subtotal * (session.tax / 100);
                        const tipAmount = subtotal * (session.tip / 100);
                        const total = subtotal + taxAmount + tipAmount;

                        return (
                            <div 
                                key={user.email} 
                                className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500"
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="text-lg font-semibold text-gray-800">
                                            {user.email}
                                        </h4>
                                        {user.email === userEmail && (
                                            <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded mt-1 inline-block">
                                                You
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold text-gray-800">
                                            ${total.toFixed(2)}
                                        </div>
                                        <div className="text-xs text-gray-500">Total</div>
                                    </div>
                                </div>

                                {claimedItems.length > 0 ? (
                                    <>
                                        <div className="space-y-2 mb-4">
                                            <h5 className="text-sm font-medium text-gray-600 mb-2">Items:</h5>
                                            {claimedItems.map((item) => {
                                                const shareCount = item.shareable ? item.claimedBy.length : 1;
                                                const itemCost = parseFloat(item.cost) / shareCount;
                                                
                                                return (
                                                    <div 
                                                        key={item.id} 
                                                        className="flex justify-between items-center bg-gray-50 p-3 rounded"
                                                    >
                                                        <div className="flex-1">
                                                            <span className="text-gray-800">{item.name}</span>
                                                            {item.shareable && (
                                                                <span className="ml-2 text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                                                                    Shared ({shareCount} people)
                                                                </span>
                                                            )}
                                                        </div>
                                                        <span className="font-medium text-gray-700">
                                                            ${itemCost.toFixed(2)}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>

                                        <div className="border-t pt-3 space-y-1 text-sm">
                                            <div className="flex justify-between text-gray-600">
                                                <span>Subtotal:</span>
                                                <span>${subtotal.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Tax:</span>
                                                <span>${taxAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-gray-600">
                                                <span>Tip:</span>
                                                <span>${tipAmount.toFixed(2)}</span>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <div className="text-gray-500 text-sm italic">
                                        No items claimed
                                    </div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
}