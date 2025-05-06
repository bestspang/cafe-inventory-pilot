
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface CostHistoryEntry {
  id: string;
  ingredientId: string;
  previousCost: number | null;
  newCost: number;
  changedAt: string;
  changedBy: string;
  changedByName: string | null;
}

export const useCostHistory = () => {
  const [costHistory, setCostHistory] = useState<CostHistoryEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchCostHistory = async (ingredientId: string) => {
    try {
      setIsLoading(true);
      
      const { data, error } = await supabase
        .from('ingredient_cost_history')
        .select(`
          id,
          ingredient_id,
          previous_cost,
          new_cost,
          changed_at,
          changed_by,
          profiles(name)
        `)
        .eq('ingredient_id', ingredientId)
        .order('changed_at', { ascending: false });
      
      if (error) {
        throw error;
      }
      
      // Map and format the data
      const formattedData = data.map((item: any) => ({
        id: item.id,
        ingredientId: item.ingredient_id,
        previousCost: item.previous_cost,
        newCost: item.new_cost,
        changedAt: item.changed_at,
        changedBy: item.changed_by,
        changedByName: item.profiles?.name
      }));
      
      setCostHistory(formattedData);
    } catch (error: any) {
      console.error('Error fetching cost history:', error);
      toast({
        title: "Failed to load cost history",
        description: error.message || "Please try again later.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    costHistory,
    isLoading,
    fetchCostHistory
  };
};
