import { STATUS, type ShoppingItem } from "../types/ShoppingList";

export const ShoppingListMock: ShoppingItem[] = [
  {
    id: crypto.randomUUID().toString(),
    title: "Monitor 27 polegadas",
    price: "R$ 1.299,90",
    status: STATUS.PLANNED,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: crypto.randomUUID().toString(),
    title: "Cadeira ergonomica",
    price: "R$ 899,90",
    status: STATUS.TO_BUY,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
  {
    id: crypto.randomUUID().toString(),
    title: "Mouse sem fio",
    price: "R$ 159,90",
    status: STATUS.BOUGHT,
    createdAt: new Date(),
    updatedAt: new Date(),
  },
];
