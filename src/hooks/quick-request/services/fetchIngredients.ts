
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import { QuickRequestIngredient } from '@/types/quick-request';

export const fetchIngredients = async (branchId?: string): Promise<QuickRequestIngredient[]> => {
  try {
    if (!branchId) {
      console.warn('No branch ID provided for ingredient fetch');
      return [];
    }
    
    console.log(`Fetching ingredients for branch ${branchId}...`);
    
    // Get ALL ingredients first - not filtered by branch
    const { data: allIngredientsData, error: allIngredientsError } = await supabase
      .from('ingredients')
      .select('id, name, unit')
      .eq('is_active', true);
    
    if (allIngredientsError) {
      console.error('Error fetching ingredients:', allIngredientsError);
      throw allIngredientsError;
    }
    
    console.log('All ingredients loaded:', allIngredientsData?.length || 0);
    
    let ingredientsWithQuantity: QuickRequestIngredient[] = (allIngredientsData || []).map(ingredient => ({
      ...ingredient,
      quantity: 0
    }));
    
    // If branch is selected, fetch stock levels
    if (branchId) {
      const { data: stockData, error: stockError } = await supabase
        .from('branch_inventory')
        .select('ingredient_id, on_hand_qty, reorder_pt')
        .eq('branch_id', branchId);
      
      if (stockError) {
        console.error('Error fetching stock levels:', stockError);
      } else if (stockData) {
        console.log('Stock data loaded:', stockData.length);
        
        // Create map of stock data
        const stockMap = new Map();
        stockData.forEach(item => {
          stockMap.set(item.ingredient_id, {
            onHandQty: item.on_hand_qty,
            reorderPt: item.reorder_pt
          });
        });
        
        // Enrich ingredients with stock data
        ingredientsWithQuantity = ingredientsWithQuantity.map(ing => {
          const stockInfo = stockMap.get(ing.id);
          return {
            ...ing,
            onHandQty: stockInfo?.onHandQty,
            reorderPt: stockInfo?.reorderPt
          };
        });
      }
    }
    
    console.log('Processing ingredients with quantities:', ingredientsWithQuantity.length);
    return ingredientsWithQuantity;
  } catch (error) {
    console.error('Error fetching ingredients:', error);
    toast({
      title: 'Error',
      description: 'Failed to fetch ingredients',
      variant: 'destructive'
    });
    return [];
  }
};
