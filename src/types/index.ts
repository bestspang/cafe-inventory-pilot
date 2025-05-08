
import { Icons } from "@/components/icons"

export interface NavItem {
  title: string
  href: string
  disabled?: boolean
  external?: boolean
  icon?: keyof typeof Icons
  label?: string
}

export interface NavLink extends Omit<NavItem, "icon"> {
  icon?: React.ForwardRefExoticComponent<
    Omit<React.SVGProps<SVGSVGElement>, "ref"> & {
      title?: string | undefined
      titleId?: string | undefined
    } & React.RefAttributes<SVGSVGElement>
  >
}

export interface SidebarNavItem extends NavItem {
  items: SidebarNavItem[]
}

export interface Ingredient {
  id: string;
  name: string;
  unit: string;
  costPerUnit?: number;
  categoryId?: string;
  categoryName?: string;
  branch_id?: string;
  isActive?: boolean;
  created_by: string; // Made required to match DB schema
}

export interface Category {
  id: string;
  name: string;
}

export type ViewMode = "list" | "grid"

export interface User {
  id: string;
  email: string;
  name?: string;
  role?: UserRole;
  branchId?: string;
}

export type UserRole = 'owner' | 'manager' | 'staff';

export interface Branch {
  id: string;
  name: string;
  address?: string | null;
  timezone?: string | null;
  is_open?: boolean;
  owner_id: string; // Made required to match DB schema
  created_at?: string;
  updated_at?: string;
}

export interface BranchActivity {
  id: string;
  branch_id: string;
  action: string;
  performed_by: string;
  performed_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface StaffMember {
  id: string;
  branchId: string;
  staffName: string;
  createdAt?: string;
  branchName?: string;
}
