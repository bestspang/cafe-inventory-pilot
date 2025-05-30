import { Branch } from '@/types';
import { Ingredient } from '@/types';

export interface StockItem {
  id: string;
  name: string;
  unit: string;
  categoryId?: string;
  categoryName?: string;
  onHandQty: number;  // Changed from quantity to onHandQty
  reorderPt: number;  // Changed to camelCase for consistency
  lastChange: number; // Add this field
  isActive?: boolean;
  branch_id?: string; // Add branch_id to support per-branch inventory
  costPerUnit?: number;
}

export interface StockCheck {
  id: string;
  branch_id: string;
  user_id: string;
  checked_at: string;
  username?: string;
}

export interface StockCheckItem {
  id: string;
  stock_check_id: string;
  ingredient_id: string;
  on_hand_before?: number;
  on_hand_after?: number;
  qty_diff?: number;
}

export interface StockActivity {
  id: string;
  ingredient: {
    name: string;
    unit: string;
  };
  on_hand_before?: number;
  on_hand_after?: number;
  qty_diff?: number;
  stock_check_id: string;
  user_id?: string;
  checked_at: string;
  username?: string;
}

export interface StockCheckSettings {
  id: string;
  branch_id: string;
  show_stock_detail: boolean;
  auto_reorder: boolean;
  updated_at: string;
}
