
import { Ingredient } from '@/types';

export interface QuickRequestIngredient extends Ingredient {
  quantity: number;
}

export interface StaffMember {
  id: string;
  staff_name: string;
  branch_id?: string;
  created_at?: string;
}

export interface QuickRequestFormState {
  branchId: string;
  staffId: string;
  action: 'request' | 'stock-update';
  ingredients: QuickRequestIngredient[];
}
