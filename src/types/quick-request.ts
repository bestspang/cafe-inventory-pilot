
import { Branch } from './index';
import { StockItem } from './stock-check';

export interface StaffMember {
  id: string;
  branchId: string;
  staffName: string;
  createdAt: string;
}

export interface QuickRequestIngredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
}

export interface QuickRequestFormState {
  action: 'request' | 'stock-update';
  branchId: string;
  staffId: string;
  ingredients: QuickRequestIngredient[];
  comment: string;
}
