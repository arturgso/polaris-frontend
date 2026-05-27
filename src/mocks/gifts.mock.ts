import type { Gift } from "../types/Gifts";

export const GiftsMock: Gift[] = [
    {
    id: crypto.randomUUID().toString(),
    title: "Teclado Mecanico",
    link: "https://youtube.com",
    giftFor: "Itallo",
    event: "Natal",
    status: "IDEA",
    createdAt: new Date(),
    updatedAt: new Date()
    },
{
    id: crypto.randomUUID().toString(),
    title: "Gloss boticario",
    link: "https://youtube.com",
    giftFor: "Bia",
    event: "BIRTHDAY",
    status: "PURCHESED",
    createdAt: new Date(),
    updatedAt: new Date()
    },

{
    id: crypto.randomUUID().toString(),
    title: "Mini PC",
    link: "https://youtube.com",
    giftFor: "Artur",
    event: "Natal",
    status: "IDEA",
    createdAt: new Date(),
    updatedAt: new Date()
    },


]