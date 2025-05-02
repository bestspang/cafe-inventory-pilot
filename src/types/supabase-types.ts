
import { Database } from '@/integrations/supabase/types';

// Define table types from the Database type
export type ProfilesTable = Database['public']['Tables']['profiles']['Row'];
export type BranchesTable = Database['public']['Tables']['branches']['Row'];
export type CategoriesTable = Database['public']['Tables']['categories']['Row'];
export type IngredientsTable = Database['public']['Tables']['ingredients']['Row'];
export type StockChecksTable = Database['public']['Tables']['stock_checks']['Row'];
export type StockCheckItemsTable = Database['public']['Tables']['stock_check_items']['Row'];
export type RequestsTable = Database['public']['Tables']['requests']['Row'];
export type RequestItemsTable = Database['public']['Tables']['request_items']['Row'];
export type RolesTable = Database['public']['Tables']['roles']['Row'];

// Export enhanced types that extend the database types
export type Profile = ProfilesTable;
export type Branch = BranchesTable;
export type Category = CategoriesTable;
export type Ingredient = IngredientsTable;
export type StockCheck = StockChecksTable & {
  items?: StockCheckItemsTable[];
};
export type Request = RequestsTable & {
  items?: RequestItemsTable[];
};

// Re-export the UserRole type from our main types file
export { UserRole } from '@/types';
