
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface StockActivity {
  id: string;
  checkedAt: string;
  branchName: string;
  staffName: string;
  ingredient: string;
  quantity: number;
  unit: string;
  comment: string | null;
  source: 'stock-check' | 'fulfilled-request' | null;
  requestedBy: string | null;
}

export const useStockActivity = () => {
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchActivities = useCallback(async () => {
    try {
      // First, get the regular stock checks
      const { data: stockCheckData, error: stockCheckError } = await supabase
        .from('stock_checks')
        .select(`
          id, 
          checked_at,
          branches(name),
          user_id,
          stock_check_items(
            id,
            on_hand_qty,
            ingredients(id, name, unit)
          )
        `)
        .order('checked_at', { ascending: false })
        .limit(100);
        
      if (stockCheckError) throw stockCheckError;
      
      // Separate query to get staff names from store_staff table and profiles
      const userIds = stockCheckData?.map(sc => sc.user_id) || [];
      const { data: staffData } = await supabase
        .from('store_staff')
        .select('id, staff_name')
        .in('id', userIds);
        
      // Also get profiles data for email usernames
      const { data: profilesData } = await supabase
        .from('profiles')
        .select('id, email, name')
        .in('id', userIds);
        
      // Create a map of user IDs to staff names
      const staffMap = new Map();
      if (staffData) {
        staffData.forEach(staff => {
          staffMap.set(staff.id, staff.staff_name);
        });
      }
      
      // Create a map for profile emails/names
      const profileMap = new Map();
      if (profilesData) {
        profilesData.forEach(profile => {
          // Extract local part of email if available
          let displayName = profile.name;
          if (profile.email && !displayName) {
            const emailLocal = profile.email.split('@')[0];
            displayName = emailLocal;
          }
          profileMap.set(profile.id, displayName || 'Unknown User');
        });
      }
      
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
      
      const formattedActivities: StockActivity[] = [];
      
      // Process regular stock checks
      if (stockCheckData) {
        stockCheckData.forEach(stockCheck => {
          // First check for staff name from staff map
          let staffName = staffMap.get(stockCheck.user_id);
          
          // If not found in staff map, check profiles
          if (!staffName && profileMap.has(stockCheck.user_id)) {
            staffName = profileMap.get(stockCheck.user_id);
          }
          
          // Fallback name
          if (!staffName) {
            staffName = 'Unknown Staff';
          }
          
          if (stockCheck.stock_check_items && stockCheck.stock_check_items.length > 0) {
            stockCheck.stock_check_items.forEach(item => {
              if (item.ingredients) {
                formattedActivities.push({
                  id: `sci-${item.id}`, // Add prefix to distinguish stock check items
                  checkedAt: stockCheck.checked_at,
                  branchName: stockCheck.branches?.name || 'Unknown',
                  staffName,
                  ingredient: item.ingredients.name,
                  quantity: item.on_hand_qty,
                  unit: item.ingredients.unit,
                  comment: null,
                  source: 'stock-check',
                  requestedBy: null
                });
              }
            });
          }
        });
      }
      
      // Process fulfilled requests
      if (requestData) {
        requestData.forEach(request => {
          // Get the name of who made the request using store_staff
          let requesterName = 'Unknown';
          if (request.store_staff) {
            requesterName = request.store_staff.staff_name || 'Unknown';
          }
          
          if (request.request_items && request.request_items.length > 0) {
            request.request_items.forEach(item => {
              if (item.ingredients) {
                formattedActivities.push({
                  id: `req-${item.id}`, // Add prefix for request items
                  checkedAt: request.requested_at,
                  branchName: request.branches?.name || 'Unknown',
                  staffName: 'System', // Stock was updated by system
                  ingredient: item.ingredients.name,
                  quantity: item.quantity,
                  unit: item.ingredients.unit,
                  comment: 'Fulfilled from request',
                  source: 'fulfilled-request',
                  requestedBy: requesterName
                });
              }
            });
          }
        });
      }
      
      // Sort all activities by date (newest first)
      formattedActivities.sort((a, b) => 
        new Date(b.checkedAt).getTime() - new Date(a.checkedAt).getTime()
      );
      
      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching stock activities:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  useEffect(() => {
    fetchActivities();
    
    // Set up a subscription for real-time updates
    const channel = supabase
      .channel('stock_check_updates')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stock_checks' },
        () => {
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'stock_check_items' },
        () => {
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'requests' },
        (payload) => {
          // Only refetch if a request status changed to fulfilled
          if (payload.new && payload.new.status === 'fulfilled') {
            fetchActivities();
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'stock_check_items' },
        () => {
          fetchActivities();
        }
      )
      .on(
        'postgres_changes',
        { event: 'DELETE', schema: 'public', table: 'request_items' },
        () => {
          fetchActivities();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);
  
  return { 
    activities, 
    isLoading,
    refetchActivities: fetchActivities 
  };
};
