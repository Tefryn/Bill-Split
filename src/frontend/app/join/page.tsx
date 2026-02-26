"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Header } from "@/components/organisms/header";
import { Input } from "@/components/atoms/input";
import { useUser } from "@/components/molecules/userContext";

export default function CreateSessionPage() {
    const { setUser } = useUser();
    const [sessionId, setSessionId] = useState("");
    const [userEmail, setUserEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [errMessage, setErrMessage] = useState("");
    const API_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_IP}:${process.env.NEXT_PUBLIC_BACKEND_PORT}` || "http://localhost:8080";
    const router = useRouter();

    const handleJoin = async (e: React.FormEvent) => {
        if (isLoading || !userEmail) {
            return
        }
        e.preventDefault();

        const mutation = `
            mutation JoinSession($sessionId: ID!, $userEmail: String!) {
                joinSession(sessionId: $sessionId, userEmail: $userEmail)
            }
        `;

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
                        sessionId: sessionId,
                        userEmail: userEmail
                    },
                }),
            });

            const result = await response.json();

            if (result.errors) {
                console.error(`GraphQL Error: ${result.errors[0].message}`);
            } else if (result.data?.joinSession && result.data?.joinSession) {
                setUser(userEmail, sessionId);
                router.push(`/session`);
            } else {
                setErrMessage("Failed to join session.");
                setTimeout(() => setErrMessage(""), 3000);
            }
        } catch (err) {
            console.error("Network error occurred.", err);
        }
        setIsLoading(false);
    };



    return (
        <main className="max-w-2xl mx-auto p-6">
            <Header
                title="Join Session"
                subtitle=""
                showBackButton
                backHref="/"
            />

            <section className="space-y-6 bg-white p-6 rounded-lg shadow-sm border">
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

                {/* Session ID Entry */}
                <div>
                    <label className="block text-sm font-medium mb-2 text-gray-700">
                        Session ID:
                    </label>
                    <Input
                        type="text"
                        value={sessionId}
                        onChange={setSessionId}
                        placeholder="Enter Session ID"
                    />
                </div>

                <h2 className="text-lg font-semibold mb-4 text-red-600">{errMessage}</h2>

                <hr className="border-t border-gray-900 my-8" />

                <button
                    onClick={handleJoin}
                    className="w-full bg-blue-600 text-white py-2 rounded-md font-semibold hover:bg-blue-700">
                    Join Session
                </button>
            </section>
        </main>
    );
}