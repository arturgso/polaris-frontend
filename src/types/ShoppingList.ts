export const STATUS = {
  IDEA: "idea",
  PLANNED: "planned",
  TO_BUY: "to_buy",
  BOUGHT: "bought",
  CANCELED: "canceled",
} as const;

export type Status = (typeof STATUS)[keyof typeof STATUS];

export interface ShoppingItem {
    id: string;
    title: string;
    price: string;
    status: Status;
    createdAt: Date;
    updatedAt: Date;
}