
import { Ingredient } from '@/types';

export interface StockItem extends Ingredient {
  categoryName: string;
  onHandQty: number;
  reorderPt: number; // Add reorderPt field for branch-specific threshold
}
