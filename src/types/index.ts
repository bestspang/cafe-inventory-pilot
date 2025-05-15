
export type UserRole = 'owner' | 'manager' | 'staff';

export interface User {
  id: string;
  email: string;
  name?: string;
  role: UserRole;
  avatar_url?: string;
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
}

export interface StaffMember {
  id: string;
  staff_name: string;
  branch_id: string;
  created_at?: string;
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
