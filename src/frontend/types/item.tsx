export default interface Item {
    id: number;
    name: string;
    cost: string;
    splitCost: string;
    shareable: boolean;
    claimedBy: string[];
}