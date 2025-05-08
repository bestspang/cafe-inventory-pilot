
import { supabase } from '@/integrations/supabase/client';

export const deleteStockActivity = async (activityId: string) => {
  try {
    if (activityId.startsWith('sci-')) {
      // Extract the actual ID without any prefix
      const stockCheckItemId = activityId.substring(4);
      
      const { error } = await supabase
        .from('stock_check_items')
        .delete()
        .eq('id', stockCheckItemId);
      
      if (error) throw error;
      return true;
    } 
    else if (activityId.startsWith('req-')) {
      // For request items, extract the ID number
      const requestItemId = activityId.substring(4);
      
      const { error } = await supabase
        .from('request_items')
        .delete()
        .eq('id', requestItemId);
      
      if (error) throw error;
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting activity:', error);
    throw error;
  }
};
