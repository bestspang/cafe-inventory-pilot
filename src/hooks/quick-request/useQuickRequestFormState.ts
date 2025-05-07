
import { useState } from 'react';
import { QuickRequestFormState, QuickRequestIngredient } from '@/types/quick-request';

export const useQuickRequestFormState = (ingredients: QuickRequestIngredient[] = []) => {
  // Initialize state with ingredients and ensure all quantities start at 0
  const initialIngredients = ingredients.map(ing => ({
    ...ing,
    quantity: 0
  }));

  const [formState, setFormState] = useState<QuickRequestFormState>({
    action: 'request',
    branchId: '',
    staffId: '',
    ingredients: initialIngredients,
    comment: ''
  });
  
  // This function is called for each keystroke in the quantity inputs
  // It ensures the value is immediately updated in state
  const handleUpdateQuantity = (id: string, quantity: number) => {
    // Ensure quantity is a valid number
    const validQuantity = isNaN(quantity) ? 0 : quantity;
    
    console.log(`Updating quantity for ${id} to ${validQuantity}`);
    
    setFormState(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ing, quantity: validQuantity } : ing
      )
    }));
  };
  
  const handleReset = () => {
    setFormState({
      action: 'request',
      branchId: '',
      staffId: '',
      ingredients: ingredients.map(ing => ({ ...ing, quantity: 0 })),
      comment: ''
    });
  };
  
  return {
    formState,
    setFormState,
    handleUpdateQuantity,
    handleReset
  };
};
