export interface StatusDTO {
  id: number;
  value: string;
  name: string;
  color?: string;
}

export interface GiftStatusDTO {
  name: string;
  title: string;
}

export interface StatusesDTO {
  giftStatus: StatusDTO[];
  shoppingItemsStatus: StatusDTO[];
}
