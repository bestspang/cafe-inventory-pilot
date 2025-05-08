
import { useState, useEffect } from 'react';
import { QuickRequestFormState, QuickRequestIngredient } from '@/types/quick-request';

export const useQuickRequestFormState = (ingredients: QuickRequestIngredient[] = []) => {
  // Initialize state with empty ingredients array
  const [formState, setFormState] = useState<QuickRequestFormState>({
    action: 'request',
    branchId: '',
    staffId: '',
    ingredients: [],
    comment: ''
  });
  
  // Initialize ingredients with quantities only once when ingredients array changes
  useEffect(() => {
    if (ingredients.length > 0) {
      setFormState(prev => ({
        ...prev,
        ingredients: ingredients.map(ing => ({
          ...ing,
          quantity: 0 // Reset quantity when ingredients change
        }))
      }));
    }
  }, [ingredients]); // Dependencies include ingredients so it updates when they change
  
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
    setFormState(prev => ({
      ...prev,
      action: 'request',
      staffId: '',
      ingredients: prev.ingredients.map(ing => ({ ...ing, quantity: 0 })),
      comment: ''
    }));
  };
  
  return {
    formState,
    setFormState,
    handleUpdateQuantity,
    handleReset
  };
};
