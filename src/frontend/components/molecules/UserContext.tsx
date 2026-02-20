'use client';
import React, { createContext, useContext, useState, ReactNode } from "react";

interface UserContextType {
    email: string;
    sessionId: string;
    setUser: (email: string, sessionId: string) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
    const [email, setEmail] = useState("");
    const [sessionId, setSessionId] = useState("");

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