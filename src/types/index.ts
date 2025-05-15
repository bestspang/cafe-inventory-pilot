
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

// Add missing types
export interface Ingredient {
  id: string;
  name: string;
  categoryId: string;
  categoryName?: string;
  unit: string;
  costPerUnit?: number;
  isActive?: boolean;
  branch_id?: string; // Add branch_id to Ingredient type
}

export interface Category {
  id: string;
  name: string;
}

// Re-export StockItem for consistency
export interface StockItem {
  id: string;
  name: string;
  quantity: number;
  unit: string;
  categoryId?: string;
  categoryName?: string;
  reorder_point?: number;
}
