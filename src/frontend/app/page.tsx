'use client';
import { useRouter } from "next/navigation";
import { Input } from "@/components/atoms/input";
import { useState } from "react";

export default function Home() {
  const [groupName, setGroupName] = useState("");
  const router = useRouter();

  const handleStart = (e: React.FormEvent) => {
    e.preventDefault();
    if (groupName.trim()) {
      // sends group name to creation page
      router.push(`/creation?name=${encodeURIComponent(groupName)}`);
    }
  };

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full text-center space-y-8">
        <section>
          <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
            Bill <span className="text-blue-600">Split</span>
          </h1>
        </section>

        <form onSubmit = {handleStart} className="mt-8 space-y-4">
          <div className="text-left">
            <label htmlFor="group-name" className="block text-sm font-medium text-gray-700 mb-1">
              Enter Group Name
            </label>
            <Input
              id="group-name"
              placeholder=""
              value={groupName}
              onChange={setGroupName}
              required
            />
          </div>
          
          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Create Your Group
          </button>
        </form>
      </div>
    </main>
  );
}