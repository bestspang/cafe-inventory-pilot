
import { Category } from '@/types';
import { StockItem } from '@/types/stock-check';

// Mock data for demo purposes
export const mockCategories: Category[] = [
  { id: '1', name: 'Dairy' },
  { id: '2', name: 'Produce' },
  { id: '3', name: 'Coffee & Tea' },
  { id: '4', name: 'Bakery' },
  { id: '5', name: 'Packaging' }
];

export const mockIngredients: StockItem[] = [
  { 
    id: '1', 
    name: 'Coffee Beans', 
    categoryId: '3', 
    categoryName: 'Coffee & Tea',
    unit: 'kg', 
    defaultReorderPoint: 5,
    onHandQty: 8
  },
  { 
    id: '2', 
    name: 'Whole Milk', 
    categoryId: '1',
    categoryName: 'Dairy', 
    unit: 'liter', 
    defaultReorderPoint: 10,
    onHandQty: 6
  },
  { 
    id: '3', 
    name: 'Avocado', 
    categoryId: '2',
    categoryName: 'Produce', 
    unit: 'pcs', 
    defaultReorderPoint: 15,
    onHandQty: 4
  },
  { 
    id: '4', 
    name: 'Croissant', 
    categoryId: '4',
    categoryName: 'Bakery', 
    unit: 'pcs', 
    defaultReorderPoint: 20,
    onHandQty: 12
  },
  { 
    id: '5', 
    name: 'To-Go Cups (12oz)', 
    categoryId: '5',
    categoryName: 'Packaging', 
    unit: 'box', 
    defaultReorderPoint: 3,
    onHandQty: 1
  },
];
