
import React, { useEffect } from 'react';
import { toast } from '@/hooks/use-toast';
import { useQuickRequestData } from '@/hooks/quick-request/useQuickRequestData';
import { useQuickRequestFormState } from '@/hooks/quick-request/useQuickRequestFormState';
import { useQuickRequestSubmit } from '@/hooks/quick-request/useQuickRequestSubmit';
import QuickRequestHeader from './QuickRequestHeader';
import QuickRequestIngredientsTable from './QuickRequestIngredientsTable';
import QuickRequestFooter from './QuickRequestFooter';

const QuickRequestForm: React.FC = () => {
  // Get data and state from custom hooks
  const { 
    isLoading, 
    setIsLoading,
    branches, 
    staffMembers, 
    ingredients, 
    fetchStaffMembers 
  } = useQuickRequestData();
  
  const {
    formState,
    setFormState,
    handleUpdateQuantity,
    handleReset
  } = useQuickRequestFormState(ingredients);
  
  const { isSubmitting, handleSubmit } = useQuickRequestSubmit();
  
  // Fetch staff members when branch changes
  useEffect(() => {
    if (formState.branchId) {
      fetchStaffMembers(formState.branchId).then(staff => {
        if (staff && staff.length > 0) {
          setFormState(prev => ({ ...prev, staffId: staff[0].id }));
        } else {
          // Clear staffId if no staff members found
          setFormState(prev => ({ ...prev, staffId: '' }));
        }
      });
    }
  }, [formState.branchId]);
  
  // Update ingredients when they change in the data hook
  useEffect(() => {
    if (ingredients.length > 0) {
      // Preserve any quantities the user has already entered when ingredients update
      const updatedIngredients = ingredients.map(ing => {
        const existingIng = formState.ingredients.find(i => i.id === ing.id);
        return {
          ...ing,
          quantity: existingIng ? existingIng.quantity : 0
        };
      });
      
      setFormState(prev => ({ ...prev, ingredients: updatedIngredients }));
    }
  }, [ingredients]);
  
  // Set default branch if available
  useEffect(() => {
    if (branches.length > 0 && !formState.branchId) {
      setFormState(prev => ({ ...prev, branchId: branches[0].id }));
    }
  }, [branches]);
  
  // Form validation
  const validateForm = () => {
    if (!formState.branchId) {
      toast({
        title: 'Missing Information',
        description: 'Please select a store',
        variant: 'destructive'
      });
      return false;
    }
    
    if (!formState.staffId) {
      toast({
        title: 'Missing Information',
        description: 'Please select a staff member',
        variant: 'destructive'
      });
      return false;
    }
    
    // Check if there are any items with quantity > 0
    const hasItems = formState.ingredients.some(ing => ing.quantity > 0);
    if (!hasItems) {
      toast({
        title: 'Missing Information',
        description: 'Please add at least one item with a quantity',
        variant: 'destructive'
      });
      return false;
    }
    
    return true;
  };
  
  // Handle form submission - now guaranteed to include all quantities
  const onSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault(); // Prevent default form submission
    setIsLoading(true);
    const success = await handleSubmit(formState, staffMembers, validateForm);
    if (success) {
      handleReset();
    }
    setIsLoading(false);
  };
  
  return (
    <form onSubmit={onSubmitForm} className="space-y-6">
      <QuickRequestHeader
        formAction={formState.action}
        branchId={formState.branchId}
        staffId={formState.staffId}
        branches={branches}
        staffMembers={staffMembers}
        isLoading={isLoading || isSubmitting}
        onActionChange={(value) => setFormState(prev => ({ ...prev, action: value }))}
        onBranchChange={(value) => setFormState(prev => ({ ...prev, branchId: value, staffId: '' }))}
        onStaffChange={(value) => setFormState(prev => ({ ...prev, staffId: value }))}
      />
      
      <QuickRequestIngredientsTable
        ingredients={formState.ingredients}
        onUpdateQuantity={handleUpdateQuantity}
        actionType={formState.action}
        disabled={isLoading || isSubmitting}
      />
      
      <QuickRequestFooter
        comment={formState.comment}
        onCommentChange={(value) => setFormState(prev => ({ ...prev, comment: value }))}
        onReset={handleReset}
        onSubmit={onSubmitForm}
        isLoading={isLoading || isSubmitting}
      />
    </form>
  );
};

export default QuickRequestForm;
