
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuickRequestData } from '@/hooks/quick-request/useQuickRequestData';
import { QuickRequestIngredient } from '@/types/quick-request';
import QuickRequestHeader from './QuickRequestHeader';
import QuickRequestIngredientTable from './QuickRequestIngredientTable';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface QuickRequestFormProps {
  onBranchChange: (branchId: string) => void;
}

const QuickRequestForm: React.FC<QuickRequestFormProps> = ({ onBranchChange }) => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formAction, setFormAction] = useState<'request' | 'stock-update'>('request');
  const [staffId, setStaffId] = useState<string>('');
  const [selectedIngredients, setSelectedIngredients] = useState<QuickRequestIngredient[]>([]);
  
  // State for control fields
  const {
    isLoading,
    branches,
    staffMembers,
    ingredients,
    fetchStaffMembers,
    fetchIngredients,
    selectedBranchId
  } = useQuickRequestData();
  
  // Handle branch selection
  const handleBranchChange = async (branchId: string) => {
    if (branchId === selectedBranchId) return;
    
    setStaffId('');
    setSelectedIngredients([]);
    
    // Fetch ingredients for this branch
    const branchIngredients = await fetchIngredients(branchId);
    
    // Fetch staff members for this branch
    await fetchStaffMembers(branchId);
    
    // Notify parent component
    onBranchChange(branchId);
  };
  
  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!selectedBranchId) {
      toast({
        title: "Store required",
        description: "Please select a store before submitting",
        variant: "destructive"
      });
      return;
    }
    
    if (!staffId) {
      toast({
        title: "Staff name required",
        description: "Please select or enter a staff name",
        variant: "destructive"
      });
      return;
    }
    
    // Filter ingredients that have a quantity > 0
    const itemsToSubmit = selectedIngredients.filter(ing => ing.quantity > 0);
    
    if (itemsToSubmit.length === 0) {
      toast({
        title: "No ingredients selected",
        description: "Please add quantities to at least one ingredient",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      if (formAction === 'request') {
        // Create a new request with the selected ingredients
        const { data: request, error: requestError } = await supabase
          .from('requests')
          .insert({
            branch_id: selectedBranchId,
            user_id: staffId,
            requested_at: new Date().toISOString(),
            status: 'pending'
          })
          .select('id')
          .single();
        
        if (requestError) throw requestError;
        
        // Add request items
        const requestItems = itemsToSubmit.map(ing => ({
          request_id: request.id,
          ingredient_id: ing.id,
          quantity: ing.quantity,
          note: null
        }));
        
        const { error: itemsError } = await supabase
          .from('request_items')
          .insert(requestItems);
        
        if (itemsError) throw itemsError;
        
        toast({
          title: "Request submitted",
          description: `${itemsToSubmit.length} ingredients have been requested`
        });
      } else {
        // Stock update - create a new stock check
        const { data: stockCheck, error: checkError } = await supabase
          .from('stock_checks')
          .insert({
            branch_id: selectedBranchId,
            user_id: staffId,
            checked_at: new Date().toISOString()
          })
          .select('id')
          .single();
        
        if (checkError) throw checkError;
        
        // Add stock check items and update branch inventory
        for (const ingredient of itemsToSubmit) {
          // Add to stock_check_items
          const { error: itemError } = await supabase
            .from('stock_check_items')
            .insert({
              stock_check_id: stockCheck.id,
              ingredient_id: ingredient.id,
              on_hand_qty: ingredient.quantity
            });
          
          if (itemError) throw itemError;
          
          // Update branch_inventory
          const { error: inventoryError } = await supabase
            .from('branch_inventory')
            .upsert({
              branch_id: selectedBranchId,
              ingredient_id: ingredient.id,
              on_hand_qty: ingredient.quantity,
              last_checked: new Date().toISOString()
            }, {
              onConflict: 'branch_id,ingredient_id'
            });
          
          if (inventoryError) throw inventoryError;
        }
        
        toast({
          title: "Stock update submitted",
          description: `${itemsToSubmit.length} ingredient quantities have been updated`
        });
      }
      
      // Reset form
      setSelectedIngredients(ingredients.map(ing => ({ ...ing, quantity: 0 })));
    } catch (error: any) {
      console.error(`Error submitting ${formAction}:`, error);
      toast({
        title: `Failed to submit ${formAction}`,
        description: error.message || "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Handle ingredient quantity updates
  const handleUpdateQuantity = (id: string, quantity: number) => {
    setSelectedIngredients(prev => 
      prev.map(ing => ing.id === id ? { ...ing, quantity } : ing)
    );
  };
  
  // Initialize selected ingredients when ingredients are loaded
  useEffect(() => {
    if (ingredients.length > 0 && selectedIngredients.length === 0) {
      setSelectedIngredients(ingredients);
    }
  }, [ingredients]);
  
  return (
    <form onSubmit={handleSubmit}>
      <div className="space-y-6">
        <QuickRequestHeader
          formAction={formAction}
          branchId={selectedBranchId}
          staffId={staffId}
          branches={branches}
          staffMembers={staffMembers}
          isLoading={isLoading}
          onActionChange={setFormAction}
          onBranchChange={handleBranchChange}
          onStaffChange={setStaffId}
        />
        
        <div className="bg-muted/40 p-4 rounded-md">
          <QuickRequestIngredientTable
            ingredients={selectedIngredients}
            onUpdateQuantity={handleUpdateQuantity}
            disabled={isSubmitting || !selectedBranchId}
            showDetails={formAction === 'stock-update'}
          />
        </div>
        
        <div className="flex justify-end">
          <Button 
            type="submit" 
            disabled={isSubmitting || !selectedBranchId || !staffId}
            className="w-full md:w-auto"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              formAction === 'request' ? 'Submit Request' : 'Update Stock'
            )}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default QuickRequestForm;
