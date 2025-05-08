
import { Branch } from './index';
import { StockItem } from './stock-check';

export interface StaffMember {
  id: string;
  branchId: string;
  staffName: string;
  createdAt: string;
  branchName?: string; // Add this property to fix the TypeScript error
}

export interface QuickRequestIngredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  reorderPt?: number;  // Added for stock details
  onHandQty?: number;  // Added for stock details
}

export interface QuickRequestFormState {
  action: 'request' | 'stock-update';
  branchId: string;
  staffId: string;
  ingredients: QuickRequestIngredient[];
  comment: string;
}
