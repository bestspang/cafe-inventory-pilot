
import { Ingredient } from '@/types';

export interface StockItem extends Ingredient {
  categoryName: string;
  onHandQty: number;
  reorderPt: number;
  lastChange: number; // Add lastChange field to track changes in stock
}
