"use client";
import { useState } from "react";

interface ItemProps {
    id: number;
    name: string;
    cost: string;
    shareable: boolean;
    claimedBy: string[];
}

interface ItemDisplayProps {
    item: ItemProps;
    onClaim: () => Promise<boolean>;
    onUnclaim: () => Promise<boolean>;
    isClaimed: boolean;
    disabled: boolean;
}

export function ItemDisplay({ item, onClaim, onUnclaim, isClaimed, disabled }: ItemDisplayProps) {
    const [claimStatus, setClaimStatus] = useState(isClaimed);

    const handleClick = async () => {
        const oldStatus = claimStatus;
        setClaimStatus(!claimStatus);
        let success = false;

        try {
            if (oldStatus) {
                success = await onUnclaim();
            } else {
                success = await onClaim();
            }
        }
        catch (error) {
            console.error("Error during claim/unclaim operation:", error);
            success = false;
        }

        if (!success) {
            setClaimStatus(oldStatus);
        }
    };

    return (
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
            <div>
                <p className="font-semibold text-black">{item.name}</p>
                <p className="text-sm text-gray-600">${parseFloat(item.cost).toFixed(2)} - {item.shareable ? "Shareable" : "Not Shareable"}</p>
                {item.claimedBy.length > 0 && (
                    <p className="text-xs text-gray-500">
                        Claimed by: {item.claimedBy.join(', ')}
                    </p>
                )}
            </div>
            <button
                onClick={handleClick}
                disabled={disabled}
                className={`px-4 py-2 text-white rounded-md hover:bg-opacity-80 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px] ${claimStatus ? 'bg-red-500' : 'bg-green-500'}`}
            >
                {claimStatus ? "Unclaim" : "Claim"}
            </button>
        </div>
    );
}
