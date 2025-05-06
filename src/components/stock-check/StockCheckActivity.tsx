
import React, { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';

interface StockActivity {
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

const StockCheckActivity: React.FC = () => {
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchActivities = async () => {
    try {
      // First, get the regular stock checks
      const { data: stockCheckData, error: stockCheckError } = await supabase
        .from('stock_checks')
        .select(`
          id, 
          checked_at,
          branches(name),
          profiles(name, email),
          stock_check_items(
            id,
            on_hand_qty,
            ingredients(id, name, unit)
          )
        `)
        .order('checked_at', { ascending: false })
        .limit(100);
        
      if (stockCheckError) throw stockCheckError;
      
      // Next, get request info for fulfilled requests
      // Note the change here: we fetch store_staff instead of profiles since that's what requests.user_id references
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
          // Extract staff name from user profile data
          let staffName = 'Unknown';
          if (stockCheck.profiles) {
            staffName = stockCheck.profiles.name || stockCheck.profiles.email || 'Unknown';
          }
          
          if (stockCheck.stock_check_items && stockCheck.stock_check_items.length > 0) {
            stockCheck.stock_check_items.forEach(item => {
              if (item.ingredients) {
                formattedActivities.push({
                  id: item.id,
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
          // Get the name of who made the request using store_staff instead of profiles
          let requesterName = 'Unknown';
          if (request.store_staff) {
            requesterName = request.store_staff.staff_name || 'Unknown';
          }
          
          if (request.request_items && request.request_items.length > 0) {
            request.request_items.forEach(item => {
              if (item.ingredients) {
                formattedActivities.push({
                  id: `req-${item.id}`,
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
  };
  
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
      .subscribe();
    
    return () => {
      supabase.removeChannel(channel);
    };
  }, []);
  
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };
  
  if (isLoading) {
    return (
      <div className="space-y-4">
        <h2 className="text-xl font-semibold">Recent Stock Updates</h2>
        
        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Time</TableHead>
                <TableHead>Store</TableHead>
                <TableHead>Staff</TableHead>
                <TableHead>Ingredient</TableHead>
                <TableHead>Quantity</TableHead>
                <TableHead>Source</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[...Array(5)].map((_, i) => (
                <TableRow key={i}>
                  <TableCell><Skeleton className="h-5 w-32" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-24" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-20" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-28" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-16" /></TableCell>
                  <TableCell><Skeleton className="h-5 w-40" /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Stock Updates</h2>
      
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Time</TableHead>
              <TableHead>Store</TableHead>
              <TableHead>Staff</TableHead>
              <TableHead>Ingredient</TableHead>
              <TableHead>Quantity</TableHead>
              <TableHead>Source</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {activities.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-6">
                  No activity recorded yet.
                </TableCell>
              </TableRow>
            ) : (
              activities.map(activity => (
                <TableRow key={activity.id}>
                  <TableCell className="whitespace-nowrap">
                    {formatDate(activity.checkedAt)}
                  </TableCell>
                  <TableCell>{activity.branchName}</TableCell>
                  <TableCell>
                    {activity.staffName}
                    {activity.source === 'fulfilled-request' && activity.requestedBy && (
                      <div className="text-xs text-muted-foreground">
                        Requested by: {activity.requestedBy}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{activity.ingredient}</TableCell>
                  <TableCell>
                    <Badge variant={activity.source === 'fulfilled-request' ? 'success' : 'outline'}>
                      {activity.quantity} {activity.unit}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {activity.source === 'fulfilled-request' ? (
                      <Badge variant="secondary">Fulfilled Request</Badge>
                    ) : (
                      activity.comment || 'Stock Check'
                    )}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};

export default StockCheckActivity;
