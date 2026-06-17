export type ShoppingItemStatusName = 'IDEA' | 'PLANNED' | 'TO_BUY' | 'BOUGHT' | 'CANCELED';

export type ShoppingItemCategoryName = 'TECH' | 'HEALTH' | 'MAKEUP' | 'OTHER';

export interface ShoppingItemStatus {
  id: number;
  value: ShoppingItemStatusName;
  name: string;
  color?: string;
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

export interface ShoppingList {
  id: number;
  title: string;
  createdAt: string;
  updatedAt: string;
  items: ShoppingItem[];
}

export interface NewShoppingItemDTO {
  title: string;
  link: string;
  price: number;
  categoryId: number;
  status: string;
  shoppingListId?: number;
}

export interface UpdateShoppingItemDTO {
  title?: string;
  link?: string;
  price?: number;
  categoryId?: number;
  status?: string;
  shoppingListId?: number;
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
