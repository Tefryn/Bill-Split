export default interface Item {
    id: number;
    name: string;
    cost: string;
    shareable: boolean;
    claimedBy: string[];
}