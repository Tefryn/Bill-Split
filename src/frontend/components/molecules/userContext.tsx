'use client';
import React, { createContext, useContext, useState, useEffect, ReactNode } from "react";

interface UserContextType {
    email: string;
    sessionId: string;
    setUser: (email: string, sessionId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [email, setEmail] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("userEmail") || "";
        }
        return "";
    });

    const [sessionId, setSessionId] = useState<string>(() => {
        if (typeof window !== "undefined") {
            return localStorage.getItem("sessionId") || "";
        }
        return "";
    });

    useEffect(() => {
        localStorage.setItem("userEmail", email);
        localStorage.setItem("sessionId", sessionId);
    }, [email, sessionId]);

    const setUser = (email: string, sessionId: string) => {
        setEmail(email);
        setSessionId(sessionId);
    };

    return (
        <UserContext.Provider value={{ email, sessionId, setUser }}>
            {children}
        </UserContext.Provider>
    );
}

export function useUser() {
    const context = useContext(UserContext);
    if (!context) {
        throw new Error("useUser must be used within a UserProvider");
    }
    return context;
}