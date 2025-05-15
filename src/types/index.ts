export interface Branch {
  id: string;
  name: string;
  address?: string;
  timezone?: string;
  is_open: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface StaffMember {
  id: string;
  staff_name: string;
  branch_id?: string;
  created_at?: string;
}

export interface BranchActivity {
  id: string;
  action: string;
  performed_by: string;
  branch_id: string;
  performed_at: string;
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  categoryId?: string;
  categoryName?: string;
  costPerUnit?: number;
  branch_id?: string;
  isActive?: boolean;
  created_at?: string;
  created_by?: string;
}
