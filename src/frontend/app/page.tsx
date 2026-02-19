'use client';
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function Home() {
  const router = useRouter();
  const [sessionId, setSessionId] = useState("");

  const routeToCreation = (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/creation`);
  };

  const joinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    router.push(`/join`);
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <section>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Bill <span className="text-blue-600">Split</span>
          </h1>
        </section>

        <div className="flex gap-2">
          <input
            type="text"
            value={sessionId}
            onChange={(e) => setSessionId(e.target.value)}
            placeholder="Enter Session ID"
            className="flex-1 py-3 px-4 border border-gray-300 rounded-md shadow-sm text-sm text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          <button
            onClick={joinSession}
            className="py-3 px-6 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Join
          </button>
        </div>

        <button
          onClick={routeToCreation}
          className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
        >
          Create Session
        </button>
      </div>
    </main>
  );
}