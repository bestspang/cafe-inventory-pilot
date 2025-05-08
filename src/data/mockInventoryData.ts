
import { StockItem } from '@/types/stock-check';
import { Ingredient } from '@/types';

// Mock stock items for testing
export const mockStockItems: StockItem[] = [
  {
    id: '1',
    name: 'Coffee Beans',
    categoryId: '1',
    categoryName: 'Beverages',
    unit: 'kg',
    onHandQty: 5,
    reorderPt: 10,
    lastChange: 0
  },
  {
    id: '2',
    name: 'Sugar',
    categoryId: '2',
    categoryName: 'Condiments',
    unit: 'kg',
    onHandQty: 3,
    reorderPt: 5,
    lastChange: 0
  },
  {
    id: '3',
    name: 'Milk',
    categoryId: '1',
    categoryName: 'Beverages',
    unit: 'L',
    onHandQty: 12,
    reorderPt: 15,
    lastChange: 0
  },
  {
    id: '4',
    name: 'Cups (Large)',
    categoryId: '3',
    categoryName: 'Supplies',
    unit: 'box',
    onHandQty: 2,
    reorderPt: 3,
    lastChange: 0
  },
  {
    id: '5',
    name: 'Napkins',
    categoryId: '3',
    categoryName: 'Supplies',
    unit: 'pack',
    onHandQty: 8,
    reorderPt: 5,
    lastChange: 0
  }
];

// Mock ingredients for testing
export const mockIngredients: Ingredient[] = mockStockItems.map(item => ({
  id: item.id,
  name: item.name,
  categoryId: item.categoryId,
  unit: item.unit,
  categoryName: item.categoryName
}));

// Mock categories for testing
export const mockCategories = [
  { id: '1', name: 'Beverages' },
  { id: '2', name: 'Condiments' },
  { id: '3', name: 'Supplies' }
];
