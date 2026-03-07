"use client";
import { useState } from "react";

interface ItemEditorProps {
    id: number;
    name: string;
    cost: string;
    shareable: boolean;
    onEdit: (index: number, name: string, cost: number, shareable: boolean) => void;
    onDelete: (index: number) => void;
}

export const ItemEditor = ({ id, name, cost, shareable, onEdit, onDelete }: ItemEditorProps) => {
    const [editedName, setEditedName] = useState(name);
    const [editedCost, setEditedCost] = useState(cost);
    const [editedShareable, setEditedShareable] = useState(shareable);
    const [editing, setEditing] = useState(false);
    
    return (
        <li className="flex flex-col bg-white rounded-xl border border-gray-100 shadow-sm overflow-hidden">
            <div className="flex justify-between items-center p-4">
                <div className="flex flex-col">
                    <span className="text-lg font-bold text-gray-900">{name}</span>
                    <span className="text-sm text-gray-500">
                        ${parseFloat(cost).toFixed(2)} • {shareable ? "Shared" : "Not Shared"}
                    </span>
                </div>

                <button
                    onClick={() => {
                        setEditing(!editing);
                        setEditedName(name);
                        setEditedCost(cost);
                        setEditedShareable(shareable);
                    }}
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
                                <input
                                    type="text"
                                    value={editedName}
                                    onChange={(e) => setEditedName(e.target.value)}
                                    className="h-full w-full px-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                                    placeholder="Item Name">
                                </input>
                           </div>
                           <div className="h-10 w-full bg-white border rounded-md">
                                <input
                                    type="text"
                                    value={editedCost}
                                    onChange={(e) => setEditedCost(e.target.value)}
                                    className="h-full w-full px-3 text-sm font-medium text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 rounded-md"
                                    placeholder="Item Cost">
                                </input>
                           </div>
                           <button
                                onClick={() => setEditedShareable(!editedShareable)}
                                className={`w-full py-2 rounded-md transition-colors ${editedShareable ? 'bg-green-600 text-white hover:bg-green-700' : 'bg-gray-300 text-gray-700 hover:bg-gray-400'}`}
                                >
                                {editedShareable ? "Shared" : "Not Shared"}
                            </button>
                           <button
                                onClick={() => onEdit(id, editedName, parseFloat(editedCost), editedShareable)}
                                className="bg-blue-600 text-white px-4 rounded-md">
                                Save
                            </button>
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