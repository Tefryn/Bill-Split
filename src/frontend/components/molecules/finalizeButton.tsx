"use client"
import { useEffect, useState } from "react";
import { Client } from '@stomp/stompjs';
import { useUser } from "@/components/molecules/userContext";

const WEBSOCKET_URL = 'ws://localhost:8080/ws';

export default function FinalizeButton() {
    const { sessionId: sessionId } = useUser();
    const [isFinalizable, setIsFinalizable] = useState<boolean>(false);

    useEffect(() => {
        const stompClient = new Client({
            brokerURL: WEBSOCKET_URL, // WebSocket endpoint URL
            onConnect: (frame) => {
                console.log('Connected: ' + frame);
                stompClient.subscribe('/topic/session/' + sessionId, (message) => {
                    console.log("Received: " + message.body);
                    const parts = message.body.split(":", 2);
                    if (parts[1] === "finish") {
                        // Route to final itemized page
                    }
                    setIsFinalizable(parts[1] === 'true');
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
    }, [sessionId]); 

    const handleFinalize = () => {
        // GraphQL call thing a ma bob
    };

    return (
        <button 
            onClick={handleFinalize}
            className={isFinalizable ? "px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px]" : "hidden"}
        >
            Finalize Bill
        </button>
    );
};