
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { StockActivity } from './types';
import { fetchStockActivity } from './services/fetchStockActivity';
import { deleteStockActivity } from './services/deleteStockActivity';

// Properly re-export the type using 'export type' syntax
export type { StockActivity }; // Fix for isolatedModules error

export const useStockActivity = () => {
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchActivities = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await fetchStockActivity();
      setActivities(data);
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
      .channel('stock_activity_updates')
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
        { event: 'UPDATE', schema: 'public', table: 'request_items' },
        () => {
          fetchActivities();
        }
      )
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, [fetchActivities]);
  
  // Update the handleDelete function to properly handle the deletion and UI refresh
  const handleDelete = async (activityId: string) => {
    try {
      // First, optimistically update the UI
      setActivities(prev => prev.filter(activity => activity.id !== activityId));
      
      // Then perform the actual deletion
      const success = await deleteStockActivity(activityId);
      
      if (!success) {
        // If deletion failed, revert the optimistic update
        fetchActivities();
      }
      
      return success;
    } catch (error) {
      console.error('Error in handleDelete:', error);
      // If there was an error, refresh the data to ensure UI consistency
      fetchActivities();
      return false;
    }
  };
  
  return { 
    activities, 
    isLoading,
    refetchActivities: fetchActivities,
    deleteActivity: handleDelete
  };
};
