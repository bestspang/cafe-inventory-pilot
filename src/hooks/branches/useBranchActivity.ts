import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { BranchActivity } from '@/types';

export const useBranchActivity = (branchId?: string) => {
  const [activities, setActivities] = useState<BranchActivity[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchActivity = async () => {
    if (!branchId) {
      setActivities([]);
      return;
    }
    
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('branch_activity')
        .select(`
          *,
          performed_by_profile:profiles!branch_activity_performed_by_fkey(name, email)
        `)
        .eq('branch_id', branchId)
        .order('performed_at', { ascending: false });
        
      if (error) throw error;
      
      // Transform data to match our interface
      const formattedActivities: BranchActivity[] = data.map(activity => ({
        id: activity.id,
        branch_id: activity.branch_id,
        action: activity.action,
        performed_by: activity.performed_by,
        performed_at: activity.performed_at,
        user: activity.performed_by_profile ? {
          name: activity.performed_by_profile.name || '',
          email: activity.performed_by_profile.email
        } : undefined
      }));
      
      setActivities(formattedActivities);
    } catch (error) {
      console.error('Error fetching branch activity:', error);
      toast({
        title: 'Error',
        description: 'Failed to load activity log',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (branchId) {
      fetchActivity();
      
      // Subscribe to activity changes
      const channel = supabase
        .channel('branch_activity_changes')
        .on('postgres_changes', 
            { event: '*', schema: 'public', table: 'branch_activity', filter: `branch_id=eq.${branchId}` },
            () => {
              fetchActivity();
            }
        )
        .subscribe();
        
      return () => {
        supabase.removeChannel(channel);
      };
    }
  }, [branchId]);

  return { activities, isLoading, refetch: fetchActivity };
};
