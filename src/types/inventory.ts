
export type ViewMode = 'grid' | 'list';

// Add more inventory-related types as needed
export interface InventoryItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  category?: string;
  reorder_point?: number;
  cost?: number;
}
