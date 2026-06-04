export type ShoppingItemStatusName = 'IDEA' | 'PLANNED' | 'TO_BUY' | 'BOUGHT' | 'CANCELED';

export type ShoppingItemCategoryName = 'TECH' | 'HEALTH' | 'MAKEUP' | 'OTHER';

export interface ShoppingItemStatus {
  id: number;
  tag: ShoppingItemStatusName;
  name: string;
  color: string;
}

export interface ShoppingItemCategory {
  id: number;
  tag: ShoppingItemCategoryName;
  name: string;
  color: string;
  createdAt?: string;
}

export interface ShoppingItem {
  id: number;
  title: string;
  link: string;
  price: number;
  category: ShoppingItemCategory;
  status: ShoppingItemStatus;
  createdAt: string;
  updatedAt: string;
}

export interface NewShoppingItemDTO {
  title: string;
  link: string;
  price: number;
  categoryId: number;
  statusId: number;
}

export interface UpdateShoppingItemDTO {
  title?: string;
  link?: string;
  price?: number;
  categoryId?: number;
  statusId?: number;
}

export interface NewShoppingItemCategoryDTO {
  name: string;
  color?: string;
}

export interface ShoppingItemFilters {
  title?: string;
  status?: string;
  tag?: string;
}
