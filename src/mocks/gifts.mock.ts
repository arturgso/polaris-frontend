import type { Gift } from '@/types';

export const GiftsMock: Gift[] = [
  {
    id: 1,
    title: "Teclado Mecanico",
    link: "https://youtube.com",
    giftFor: "Itallo",
    event: "Natal",
    status: { name: "IDEA", title: "Ideia" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 2,
    title: "Gloss boticario",
    link: "https://youtube.com",
    giftFor: "Bia",
    event: "BIRTHDAY",
    status: { name: "PURCHASED", title: "Comprado" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 3,
    title: "Mini PC",
    link: "https://youtube.com",
    giftFor: "Artur",
    event: "Natal",
    status: { name: "IDEA", title: "Ideia" },
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];
