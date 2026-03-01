import User from "@/types/user";
import Item from "@/types/item";

export default interface Session {
    id: number;
    items: Item[];
    users: User[];
    members: string[];
    tax: number;
    tip: number;
}