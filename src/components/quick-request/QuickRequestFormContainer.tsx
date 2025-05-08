
import React, { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuickRequestData } from '@/hooks/quick-request/useQuickRequestData';
import { QuickRequestIngredient } from '@/types/quick-request';
import { useQuickRequestSubmission } from '@/hooks/quick-request/useQuickRequestSubmission';
import QuickRequestHeader from './QuickRequestHeader';
import QuickRequestIngredientTable from './QuickRequestIngredientTable';
import QuickRequestFormError from './QuickRequestFormError';
import QuickRequestFormLoading from './QuickRequestFormLoading';
import QuickRequestFormEmpty from './QuickRequestFormEmpty';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

interface QuickRequestFormContainerProps {
  onBranchChange: (branchId: string) => void;
}

const QuickRequestFormContainer: React.FC<QuickRequestFormContainerProps> = ({ onBranchChange }) => {
  const { toast } = useToast();
  const [formAction, setFormAction] = useState<'request' | 'stock-update'>('request');
  const [staffId, setStaffId] = useState<string>('');
  const [selectedIngredients, setSelectedIngredients] = useState<QuickRequestIngredient[]>([]);
  const [error, setError] = useState<string | null>(null);
  
  // Form submission handling
  const { isSubmitting, handleSubmit: submitForm } = useQuickRequestSubmission();
  
  // Data fetching from hook
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
    console.log(`Branch selected: ${branchId}`);
    
    if (branchId === selectedBranchId) return;
    
    setStaffId('');
    setSelectedIngredients([]);
    setError(null);
    
    try {
      // Fetch ingredients for this branch
      console.log(`Fetching ingredients for branch ${branchId}`);
      await fetchIngredients(branchId);
      
      // Fetch staff members for this branch
      console.log(`Fetching staff for branch ${branchId}`);
      await fetchStaffMembers(branchId);
      
      // Notify parent component
      onBranchChange(branchId);
    } catch (err) {
      console.error('Error during branch change:', err);
      setError('Failed to load branch data');
    }
  };
  
  // Handle form submission
  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const result = await submitForm(
      selectedBranchId, 
      staffId, 
      selectedIngredients, 
      formAction
    );
    
    if (result) {
      // Reset form after successful submission
      setSelectedIngredients(ingredients.map(ing => ({ ...ing, quantity: 0 })));
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
    if (ingredients.length > 0) {
      console.log(`Setting ${ingredients.length} ingredients in form state`, ingredients);
      setSelectedIngredients(ingredients);
    }
  }, [ingredients]);

  return (
    <form onSubmit={handleFormSubmit}>
      <div className="space-y-6">
        {error && <QuickRequestFormError message={error} />}
        
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
          {isLoading && selectedBranchId ? (
            <QuickRequestFormLoading />
          ) : selectedBranchId ? (
            selectedIngredients.length > 0 ? (
              <QuickRequestIngredientTable
                ingredients={selectedIngredients}
                onUpdateQuantity={handleUpdateQuantity}
                disabled={isSubmitting || !selectedBranchId}
                isLoading={isLoading}
                actionType={formAction}
              />
            ) : (
              <QuickRequestFormEmpty />
            )
          ) : (
            <div className="text-center p-4 text-muted-foreground">
              Select a store to view available ingredients
            </div>
          )}
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

export default QuickRequestFormContainer;
