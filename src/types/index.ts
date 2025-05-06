
export type UserRole = 'owner' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  name: string;
  role: UserRole;
  branchId: string;
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  timezone?: string;
}

export interface Ingredient {
  id: string;
  name: string;
  categoryId: string;
  unit: string;
  costPerUnit?: number | null;
  categoryName?: string; // Make this optional for flexibility
}

export interface Category {
  id: string;
  name: string;
}

export interface StockCheck {
  id: string;
  branchId: string;
  userId: string;
  checkedAt: string;
  items: StockCheckItem[];
}

export interface StockCheckItem {
  id: string;
  stockCheckId: string;
  ingredientId: string;
  onHandQty: number;
}

export interface Request {
  id: string;
  branchId: string;
  userId: string;
  requestedAt: string;
  status: 'pending' | 'fulfilled';
  items: RequestItem[];
}

export interface RequestItem {
  id: string;
  requestId: string;
  ingredientId: string;
  quantity: number;
  note?: string;
}
