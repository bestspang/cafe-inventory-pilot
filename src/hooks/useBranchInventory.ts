
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Ingredient } from '@/types';

export function useBranchInventory(branchId: string | null) {
  return useQuery({
    queryKey: ['branchInventory', branchId],
    queryFn: async () => {
      if (!branchId) return [];
      
      const { data, error } = await supabase
        .from('branch_inventory')
        .select(`
          on_hand_qty,
          reorder_pt,
          last_change,
          ingredient_id,
          ingredients (
            id, 
            name, 
            unit, 
            category_id,
            cost_per_unit,
            categories(id, name)
          )
        `)
        .eq('branch_id', branchId)
        .order('ingredients.name', { ascending: true });
      
      if (error) throw error;
      
      // Transform data to match our Ingredient type with additional fields
      return data.map(row => ({
        id: row.ingredient_id,
        name: row.ingredients.name,
        unit: row.ingredients.unit,
        categoryId: row.ingredients.category_id,
        categoryName: row.ingredients?.categories?.name || 'Uncategorized',
        onHandQty: row.on_hand_qty,
        reorderPt: row.reorder_pt,
        lastChange: row.last_change,
        costPerUnit: row.ingredients.cost_per_unit,
        isActive: true, // Branch inventory items are always active
        branch_id: branchId
      })) as Ingredient[];
    },
    enabled: !!branchId
  });
}
