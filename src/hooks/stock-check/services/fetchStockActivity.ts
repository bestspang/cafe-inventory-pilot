
import { supabase } from '@/integrations/supabase/client';
import { StockActivity } from '../types';
import { 
  createStaffNameLookup, 
  transformStockCheckData,
  transformRequestData
} from '../utils/transformStockActivity';

export const fetchStockActivity = async (): Promise<StockActivity[]> => {
  try {
    // First, get the regular stock checks
    const { data: stockCheckData, error: stockCheckError } = await supabase
      .from('stock_checks')
      .select(`
        id, 
        checked_at,
        branches(name),
        user_id,
        username,
        stock_check_items(
          id,
          on_hand_qty,
          ingredients(id, name, unit)
        )
      `)
      .order('checked_at', { ascending: false })
      .limit(100);
      
    if (stockCheckError) throw stockCheckError;
    
    // Get branch_inventory data to retrieve last_change info
    const { data: inventoryData, error: inventoryError } = await supabase
      .from('branch_inventory')
      .select('ingredient_id, last_change')
      .order('last_checked', { ascending: false });
      
    if (inventoryError) throw inventoryError;
    
    // Create a map of ingredient_id to last_change
    const lastChangeMap = new Map();
    if (inventoryData) {
      inventoryData.forEach(item => {
        if (item.ingredient_id && item.last_change !== undefined) {
          lastChangeMap.set(item.ingredient_id, item.last_change);
        }
      });
    }
    
    // Separate query to get staff names from store_staff table and profiles
    const userIds = stockCheckData?.map(sc => sc.user_id) || [];
    const { data: staffData } = await supabase
      .from('store_staff')
      .select('id, staff_name')
      .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);
      
    // Also get profiles data for email usernames
    const { data: profilesData } = await supabase
      .from('profiles')
      .select('id, email, name')
      .in('id', userIds.length > 0 ? userIds : ['00000000-0000-0000-0000-000000000000']);
    
    // Create lookups for user names
    const { staffMap, profileMap } = createStaffNameLookup(staffData, profilesData);
    
    // Next, get request info for fulfilled requests
    const { data: requestData, error: requestError } = await supabase
      .from('requests')
      .select(`
        id,
        requested_at,
        status,
        user_id,
        store_staff(staff_name),
        branch_id,
        branches(name),
        request_items(
          id,
          ingredient_id,
          quantity,
          ingredients(id, name, unit)
        )
      `)
      .eq('status', 'fulfilled')
      .order('requested_at', { ascending: false })
      .limit(50);
      
    if (requestError) throw requestError;
    
    // Transform the data
    const stockCheckActivities = transformStockCheckData(stockCheckData || [], staffMap, profileMap, lastChangeMap);
    const requestActivities = transformRequestData(requestData || []);
    
    // Combine and sort all activities
    const formattedActivities: StockActivity[] = [...stockCheckActivities, ...requestActivities];
    
    // Sort all activities by date (newest first)
    formattedActivities.sort((a, b) => 
      new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
    );
    
    return formattedActivities;
  } catch (error) {
    console.error('Error fetching stock activities:', error);
    return [];
  }
};
