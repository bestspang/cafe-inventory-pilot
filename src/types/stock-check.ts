
import { Ingredient } from '@/types';

export interface StockItem extends Ingredient {
  categoryName: string;
  onHandQty: number;
}
