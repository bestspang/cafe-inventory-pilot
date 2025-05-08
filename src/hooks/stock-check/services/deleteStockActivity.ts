
import { supabase } from '@/integrations/supabase/client';

export const deleteStockActivity = async (activityId: string): Promise<boolean> => {
  try {
    // Extract the ID portion and the prefix
    const parts = activityId.split('-');
    if (parts.length < 2) {
      console.error('Invalid activity ID format:', activityId);
      return false;
    }
    
    const prefix = parts[0];
    // Get the actual UUID part by joining any remaining parts
    // This handles cases where the UUID itself might contain hyphens
    const id = parts.slice(1).join('-');
    
    console.log(`Attempting to delete activity with prefix: ${prefix}, id: ${id}`);
    
    if (prefix === 'sci') {
      // If it's a stock check item
      const { error, count } = await supabase
        .from('stock_check_items')
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error('Error deleting stock check item:', error);
        return false;
      }
      
      console.log('Stock check items deleted:', count);
      return count > 0;
    } else if (prefix === 'req') {
      // If it's a request item
      // Note: For requests, we don't delete the request_item,
      // we just mark it as not fulfilled
      const { error, count } = await supabase
        .from('request_items')
        .update({ fulfilled: false })
        .eq('id', id);
        
      if (error) {
        console.error('Error updating request item:', error);
        return false;
      }
      
      console.log('Request items updated:', count);
      return count > 0;
    }
    
    return false;
  } catch (error) {
    console.error('Error deleting activity:', error);
    return false;
  }
};
