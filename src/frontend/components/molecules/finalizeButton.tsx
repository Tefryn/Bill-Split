"use client"
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Client } from '@stomp/stompjs';
import { useUser } from "@/components/molecules/userContext";

const WEBSOCKET_URL = 'ws://' + process.env.NEXT_PUBLIC_BACKEND_IP + ':' + process.env.NEXT_PUBLIC_BACKEND_PORT + '/ws' || 'ws://localhost:8080/ws';
const API_URL = `http://${process.env.NEXT_PUBLIC_BACKEND_IP}:${process.env.NEXT_PUBLIC_BACKEND_PORT}` || "http://localhost:8080";

export default function FinalizeButton() {
    const { sessionId: sessionId } = useUser();
    const [isFinalizable, setIsFinalizable] = useState<boolean>(false);
    const [errMessage, setErrMessage] = useState<string>("");
    const router = useRouter();

    useEffect(() => {        
        const stompClient = new Client({
            brokerURL: WEBSOCKET_URL, // WebSocket endpoint URL
            onConnect: (frame) => {
                console.log('WebSocket connected!', frame);
                stompClient.subscribe('/topic/session/' + sessionId, (message) => {
                    console.log("Received: " + message.body);

                    const body = message.body;
                    const [msg, status] = body.split('::');
                    if (status === "Finished") {
                        router.push(`/final`);
                    } else if (status === "Closeable") {
                        setIsFinalizable(true);
                    } else {
                        setIsFinalizable(false);
                    }
                });
            },
            onStompError: (frame) => {
                console.log('Broker reported error: ' + frame.headers['message']);
            }
        });
        stompClient.activate();

        return () => {
            if (stompClient.active) {
                console.log('Deactivating STOMP client...');
                stompClient.deactivate(); 
            }
        };
    }, [sessionId, router]); 

    const handleFinalize = async () => {
        const mutation = `
            mutation FinalizeSession($sessionId: ID!) {
                finalizeSession(sessionId: $sessionId)
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
                        sessionId: sessionId
                    }, 
                }),
            });

            const result = await response.json();
            if (!result.data?.finalizeSession) {
                setErrMessage("Finalize failed");
                setTimeout(() => setErrMessage(""), 3000);
            }
        } catch (err) {
            setErrMessage("Finalize failed: " + err);
            setTimeout(() => setErrMessage(""), 3000);
        }
    };

    return (
        <div>
            <h2 className="text-lg font-semibold mb-4 text-red-600">{errMessage}</h2>
            <button 
                onClick={handleFinalize}
                className={isFinalizable ? "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]" : "hidden"}
            >
                Finalize Bill
            </button>
        </div>
    );
};