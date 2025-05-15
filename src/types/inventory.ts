
export type ViewMode = 'grid' | 'list';

// Add more inventory-related types as needed
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  categoryId?: string;
  categoryName?: string;
  reorder_point?: number;
  cost?: number;
  onHandQty?: number;
  reorderPt?: number;
  lastChange?: number;
  branch_id?: string;
}

// For branch inventory specific data
export interface BranchInventoryItem {
  branch_id: string;
  ingredient_id: string;
  on_hand_qty: number;
  reorder_pt: number;
  last_checked?: string;
  last_change: number;
}
