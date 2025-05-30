
export type UserRole = 'owner' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar_url?: string;
  branchId?: string; // Adding branchId for NewRequest.tsx
}

export interface Branch {
  id: string;
  name: string;
  address?: string;
  timezone: string;
  is_open: boolean;
  created_at: string;
  updated_at: string;
  owner_id: string;
}

export interface BranchActivity {
  id: string;
  action: string;
  performed_at: string;
  performed_by: string;
  branch_id: string;
  user?: {  // Add user property to support ActivityLog component
    name?: string;
    email: string;
  };
}

export interface StaffMember {
  id: string;
  staff_name: string; // Using snake_case to match database schema
  branch_id: string;  // Using snake_case to match database schema
  created_at?: string;
  branchName?: string; // Extra field for display purposes
}

export interface InventoryFilters {
  search: string;
  categoryId: string;
  status: 'all' | 'active' | 'archived';
}

export interface SortState {
  column: string;
  direction: 'asc' | 'desc';
}

export type ViewMode = 'list' | 'grid';

// Updated Ingredient interface with branch inventory fields
export interface Ingredient {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  costPerUnit?: number;
  isActive?: boolean;
  branch_id?: string; // Branch this ingredient belongs to
  onHandQty?: number; // Quantity on hand in the branch
  reorderPt?: number; // Reorder point for the branch
  lastChange?: number; // Last change in quantity
}

export interface Category {
  id: string;
  name: string;
}

// Export StockItem from stock-check.ts
export * from '@/types/stock-check';
