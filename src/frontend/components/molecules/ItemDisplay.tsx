"use client";

interface ItemProps {
    id: number;
    name: string;
    cost: number;
    shareable: boolean;
    claimedBy: string[];
}

interface ItemDisplayProps {
    item: ItemProps;
    onClaim: () => void;
    onUnclaim: () => void;
    isClaimed: boolean;
    disabled: boolean;
}

export function ItemDisplay({ item, onClaim, onUnclaim, isClaimed, disabled }: ItemDisplayProps) {
    const handleClick = () => {
        if (isClaimed) {
            onUnclaim();
        } else {
            onClaim();
        }
    };

    return (
        <div className="flex justify-between items-center p-3 bg-gray-50 rounded-lg border">
            <div>
                <p className="font-semibold">{item.name}</p>
                <p className="text-sm text-gray-600">${item.cost.toFixed(2)} - {item.shareable ? "Shareable" : "Not Shareable"}</p>
                {item.claimedBy.length > 0 && (
                    <p className="text-xs text-gray-500">
                        Claimed by: {item.claimedBy.join(', ')}
                    </p>
                )}
            </div>
            <button
                onClick={handleClick}
                disabled={disabled}
                className={`px-4 py-2 text-white rounded-md hover:bg-opacity-80 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors h-[42px] ${isClaimed ? 'bg-red-500' : 'bg-green-500'}`}
            >
                {isClaimed ? "Unclaim" : "Claim"}
            </button>
        </div>
    );
}
