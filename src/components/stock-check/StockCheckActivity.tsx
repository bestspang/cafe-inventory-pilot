
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

interface StockActivity {
  id: string;
  checkedAt: string;
  branchName: string;
  staffName: string;
  ingredient: string;
  quantity: number;
  unit: string;
  comment: string | null;
}

const StockCheckActivity: React.FC = () => {
  const [activities, setActivities] = useState<StockActivity[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  const fetchActivities = async () => {
    try {
      const { data, error } = await supabase
        .from('stock_checks')
        .select(`
          id, 
          checked_at, 
          comment,
          branches(name),
          stock_check_items(
            id,
            on_hand_qty,
            ingredients(id, name, unit)
          )
        `)
        .is('user_id', null) // Only get public stock checks
        .order('checked_at', { ascending: false })
        .limit(100);
        
      if (error) throw error;
      
      if (data) {
        const formattedActivities: StockActivity[] = [];
        
        data.forEach(stockCheck => {
          // Extract staff name from comment if available
          let staffName = 'Unknown';
          if (stockCheck.comment) {
            const match = stockCheck.comment.match(/Public stock check by: (.*?)\./) || [];
            staffName = match[1] || 'Unknown';
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
                  comment: stockCheck.comment
                });
              }
            });
          }
        });
        
        setActivities(formattedActivities);
      }
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
      <div className="flex items-center justify-center h-64">
        <div className="animate-pulse text-muted-foreground">Loading activity...</div>
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
              <TableHead>Comment</TableHead>
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
                  <TableCell>{activity.staffName}</TableCell>
                  <TableCell>{activity.ingredient}</TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {activity.quantity} {activity.unit}
                    </Badge>
                  </TableCell>
                  <TableCell className="max-w-xs truncate">
                    {activity.comment ? activity.comment.replace(/Public stock check by:.*?\./, '').trim() : ''}
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
