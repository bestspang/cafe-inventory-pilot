
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from '@/hooks/use-toast';
import { QuickRequestFormState, StaffMember } from '@/types/quick-request';
import { validateStaff, validateFormData } from './utils/validation';
import { submitRequest } from './utils/requestSubmission';
import { submitStockUpdate } from './utils/stockUpdateSubmission';

export const useQuickRequestSubmit = () => {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (
    formState: QuickRequestFormState,
    staffMembers: StaffMember[],
    validateForm: () => boolean
  ) => {
    // Run validation first
    if (!validateForm()) return false;
    
    setIsSubmitting(true);
    
    try {
      console.log('Form state before submission:', formState);
      
      // Get items with quantity > 0 directly from state
      const itemsWithQuantity = formState.ingredients
        .filter(ing => ing.quantity > 0)
        .map(ing => ({
          ingredient_id: ing.id,
          quantity: ing.quantity,
          unit: ing.unit,
          name: ing.name
        }));
      
      console.log('Items to be submitted:', itemsWithQuantity);
      
      // Validate items
      if (!validateFormData(formState, itemsWithQuantity)) {
        return false;
      }
      
      // Find staff details
      const selectedStaff = staffMembers.find(s => s.id === formState.staffId);
      
      // Validate staff
      const isStaffValid = await validateStaff(formState.staffId, selectedStaff);
      if (!isStaffValid) return false;
      
      const currentTime = new Date().toISOString();
      
      if (formState.action === 'request') {
        await submitRequest(formState, selectedStaff!, itemsWithQuantity, currentTime);
        navigate('/requests');
      } else if (formState.action === 'stock-update') {
        await submitStockUpdate(formState, selectedStaff!, itemsWithQuantity, currentTime);
        navigate('/stock-check?tab=activity');
      }
      
      return true;
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'There was an error submitting your request',
        variant: 'destructive'
      });
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    isSubmitting,
    handleSubmit
  };
};
