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
  branch_id?: string; // Add branch_id to the Ingredient interface
}

export interface Category {
  id: string;
  name: string;
}

export type ViewMode = "list" | "grid"
