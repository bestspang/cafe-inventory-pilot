
// Import types from the main types file
import { Category } from '@/types';

export interface StockItem {
  id: string; // Add id field
  name: string; // Add name field
  categoryId: string; // Add categoryId field
  categoryName: string;
  unit: string; // Add unit field
  onHandQty: number;
  reorderPt: number;
  lastChange: number;
}
