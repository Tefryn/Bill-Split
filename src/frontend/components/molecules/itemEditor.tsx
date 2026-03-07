"use client";
import { useState } from "react";

interface ItemEditorProps {
    id: number;
    name: string;
    cost: number;
    shareable: boolean;
    onEdit: (index: number, name: string, cost: number, shareable: boolean) => void;
    onDelete: (index: number) => void;
}

export const ItemEditor = ({ id, name, cost, shareable, onEdit, onDelete }: ItemEditorProps) => {
    const [editing, setEditing] = useState(false);
    return (
        <li className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-4">
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900">{name}</span>
                    <span className="text-sm text-gray-500">
                        ${cost.toFixed(2)} • {shareable ? "Shared" : "Personal"}
                    </span>
                </div>

                <button
                    onClick={() => setEditing(!editing)}
                    className="px-5 py-2 text-sm font-semibold text-blue-700 bg-blue-50 hover:bg-blue-600 hover:text-white border border-blue-100 rounded-lg transition-all shadow-sm active:scale-95"
                >
                    {editing ? "Close" : "Edit Item"}
                </button>
            </div>

            {editing && (
                <div className="bg-gray-50 p-4 border-t border-gray-100 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="space-y-3">
                        <p className="text-xs font-bold uppercase text-gray-400">Editing Details</p>
                        <div className="flex gap-4">
                           <div className="h-10 w-full bg-white border rounded-md">
                           </div>
                           <button className="bg-blue-600 text-white px-4 rounded-md">Save</button>
                           <button 
                                onClick={() => onDelete(id)}
                                className="bg-red-600 text-white px-4 rounded-md">
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </li>
    );
};