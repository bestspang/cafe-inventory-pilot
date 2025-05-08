
import { supabase } from '@/integrations/supabase/client';

export const deleteStockActivity = async (activityId: string): Promise<boolean> => {
  try {
    // Extract the ID portion without the prefix
    const [prefix, id] = activityId.split('-');
    
    if (!id) {
      return false;
    }
    
    if (prefix === 'sci') {
      // If it's a stock check item
      const { error } = await supabase
        .from('stock_check_items')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      return true;
    } else if (prefix === 'req') {
      // If it's a request item
      // Note: For requests, we don't delete the request_item,
      // we just mark it as not fulfilled
      const { error } = await supabase
        .from('request_items')
        .update({ fulfilled: false })
        .eq('id', id);
        
      if (error) throw error;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting activity:', error);
    return false;
  }
};
