export enum PackId {
    SMALL = "SMALL",
    MEDIUM = "MEDIUM",
    LARGE = "LARGE",
}
export type CreditsPack = {
    id: PackId;
    name: string;
    label: string;
    credits: number;
    price: number;
    priceId : string
}

export const CreditsPack: CreditsPack[] = [
    {
        id: PackId.SMALL,
        name: "Small Pack",
        label: "1,000 credits",
        credits: 1000,
        price: 999, // $9.99
        priceId : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_SMALL!
    },
    {
        id: PackId.MEDIUM,
        name: "Meduim Pack",
        label: "5,000 credits",
        credits: 5000,
        price: 3999, // $39.99,
        priceId : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_MEDIUM!

    },
    {
        id: PackId.LARGE,
        name: "Large Pack",
        label: "15,000 credits",
        credits: 15000,
        price: 6999, // $69.99
        priceId : process.env.NEXT_PUBLIC_STRIPE_PRICE_ID_LARGE!

    },
];


export const getCreditsPack = (id: PackId) =>
    CreditsPack.find((p) => p.id === id);