import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { QuickRequestFormState, QuickRequestIngredient, StaffMember } from '@/types/quick-request';
import { Table, TableHeader, TableRow, TableHead, TableBody, TableCell } from '@/components/ui/table';
import { Branch } from '@/types';
import QuickRequestIngredientRow from './QuickRequestIngredientRow';

const QuickRequestForm: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [ingredients, setIngredients] = useState<QuickRequestIngredient[]>([]);
  
  const [formState, setFormState] = useState<QuickRequestFormState>({
    action: 'request',
    branchId: '',
    staffId: '',
    ingredients: [],
    comment: ''
  });
  
  // Fetch branches on component mount
  useEffect(() => {
    const fetchBranches = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('branches')
          .select('id, name');
        
        if (error) throw error;
        
        if (data) {
          console.log('Branches loaded:', data);
          setBranches(data);
          // If there's at least one branch, select it by default
          if (data.length > 0) {
            setFormState(prev => ({
              ...prev,
              branchId: data[0].id
            }));
          }
        }
      } catch (error) {
        console.error('Error fetching branches:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch store locations',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBranches();
  }, []);
  
  // Fetch ingredients on component mount
  useEffect(() => {
    const fetchIngredients = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('ingredients')
          .select('id, name, unit');
        
        if (error) throw error;
        
        if (data) {
          console.log('Ingredients loaded:', data.length);
          const ingredientsWithQuantity = data.map(ingredient => ({
            ...ingredient,
            quantity: 0
          }));
          
          setIngredients(ingredientsWithQuantity);
          setFormState(prev => ({
            ...prev,
            ingredients: ingredientsWithQuantity
          }));
        }
      } catch (error) {
        console.error('Error fetching ingredients:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch ingredients',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchIngredients();
  }, []);
  
  // Fetch staff members when branch changes
  useEffect(() => {
    const fetchStaffMembers = async () => {
      if (!formState.branchId) return;
      
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('store_staff')
          .select('id, branch_id, staff_name, created_at')
          .eq('branch_id', formState.branchId);
        
        if (error) throw error;
        
        if (data) {
          console.log('Staff members loaded:', data.length, 'for branch:', formState.branchId);
          const staff = data.map(item => ({
            id: item.id,
            branchId: item.branch_id,
            staffName: item.staff_name,
            createdAt: item.created_at
          }));
          setStaffMembers(staff);
          setFormState(prev => ({
            ...prev,
            staffId: staff.length > 0 ? staff[0].id : ''
          }));
        }
      } catch (error) {
        console.error('Error fetching staff members:', error);
        toast({
          title: 'Error',
          description: 'Failed to fetch staff members',
          variant: 'destructive'
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchStaffMembers();
  }, [formState.branchId]);
  
  const handleUpdateQuantity = (id: string, quantity: number) => {
    setFormState(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ing => 
        ing.id === id ? { ...ing, quantity } : ing
      )
    }));
  };
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validation
    if (!formState.branchId) {
      toast({
        title: 'Missing Information',
        description: 'Please select a store',
        variant: 'destructive'
      });
      return;
    }
    
    if (!formState.staffId) {
      toast({
        title: 'Missing Information',
        description: 'Please select a staff member',
        variant: 'destructive'
      });
      return;
    }
    
    const hasItems = formState.ingredients.some(ing => ing.quantity > 0);
    if (!hasItems) {
      toast({
        title: 'Missing Information',
        description: 'Please add at least one item with a quantity',
        variant: 'destructive'
      });
      return;
    }
    
    setIsLoading(true);
    
    try {
      // Find staff details
      const selectedStaff = staffMembers.find(s => s.id === formState.staffId);
      
      if (!selectedStaff) {
        throw new Error('Selected staff not found');
      }
      
      if (formState.action === 'request') {
        // Create request
        const { data: requestData, error: requestError } = await supabase
          .from('requests')
          .insert({
            branch_id: formState.branchId,
            user_id: null, // null for public requests
            status: 'pending',
            comment: formState.comment
          })
          .select('id')
          .single();
        
        if (requestError) throw requestError;
        
        // Create request items
        const requestItems = formState.ingredients
          .filter(ing => ing.quantity > 0)
          .map(ing => ({
            request_id: requestData.id,
            ingredient_id: ing.id,
            quantity: ing.quantity,
            note: `Requested by: ${selectedStaff.staffName}`
          }));
        
        const { error: itemsError } = await supabase
          .from('request_items')
          .insert(requestItems);
        
        if (itemsError) throw itemsError;
        
        toast({
          title: 'Request Submitted',
          description: 'Your ingredient request has been submitted successfully'
        });
        
      } else if (formState.action === 'stock-update') {
        // Create stock check
        const { data: stockCheckData, error: stockCheckError } = await supabase
          .from('stock_checks')
          .insert({
            branch_id: formState.branchId,
            user_id: null, // null for public stock checks
            comment: `Public stock check by: ${selectedStaff.staffName}. ${formState.comment}`
          })
          .select('id')
          .single();
        
        if (stockCheckError) throw stockCheckError;
        
        // Create stock check items
        const stockItems = formState.ingredients
          .filter(ing => ing.quantity > 0)
          .map(ing => ({
            stock_check_id: stockCheckData.id,
            ingredient_id: ing.id,
            on_hand_qty: ing.quantity
          }));
        
        const { error: stockItemsError } = await supabase
          .from('stock_check_items')
          .insert(stockItems);
        
        if (stockItemsError) throw stockItemsError;
        
        toast({
          title: 'Stock Update Submitted',
          description: 'Your stock update has been submitted successfully'
        });
      }
      
      // Reset the form
      setFormState({
        action: 'request',
        branchId: '',
        staffId: '',
        ingredients: ingredients.map(ing => ({ ...ing, quantity: 0 })),
        comment: ''
      });
      
    } catch (error: any) {
      console.error('Error submitting form:', error);
      toast({
        title: 'Submission Failed',
        description: error.message || 'There was an error submitting your request',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
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
  
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <Label htmlFor="action">Action</Label>
            <Select
              value={formState.action}
              onValueChange={(value: 'request' | 'stock-update') => 
                setFormState(prev => ({ ...prev, action: value }))
              }
              disabled={isLoading}
            >
              <SelectTrigger id="action">
                <SelectValue placeholder="Select action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="request">Request Ingredient</SelectItem>
                <SelectItem value="stock-update">Stock Update</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="branch">Store</Label>
            <Select
              value={formState.branchId}
              onValueChange={(value) => setFormState(prev => ({ ...prev, branchId: value }))}
              disabled={isLoading}
            >
              <SelectTrigger id="branch">
                <SelectValue placeholder={isLoading ? "Loading stores..." : "Select store"} />
              </SelectTrigger>
              <SelectContent>
                {branches.length === 0 ? (
                  <SelectItem value="loading" disabled>No stores available</SelectItem>
                ) : (
                  branches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="staff">Staff Name</Label>
            <Select
              value={formState.staffId}
              onValueChange={(value) => setFormState(prev => ({ ...prev, staffId: value }))}
              disabled={isLoading || !formState.branchId || staffMembers.length === 0}
            >
              <SelectTrigger id="staff">
                <SelectValue placeholder={
                  !formState.branchId 
                    ? "Select store first" 
                    : staffMembers.length === 0 
                      ? "No staff members found" 
                      : "Select staff member"
                } />
              </SelectTrigger>
              <SelectContent>
                {staffMembers.map(staff => (
                  <SelectItem key={staff.id} value={staff.id}>
                    {staff.staffName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div>
          <h3 className="text-lg font-medium mb-2">
            {formState.action === 'request' ? 'Request Ingredients' : 'Stock Update'}
          </h3>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ingredient</TableHead>
                  <TableHead>Quantity</TableHead>
                  <TableHead>Unit</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {formState.ingredients.map(ingredient => (
                  <QuickRequestIngredientRow
                    key={ingredient.id}
                    ingredient={ingredient}
                    onUpdateQuantity={handleUpdateQuantity}
                    disabled={isLoading}
                  />
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
        
        <div>
          <Label htmlFor="comment">Comments</Label>
          <Textarea
            id="comment"
            placeholder="Add any additional information here..."
            value={formState.comment}
            onChange={(e) => setFormState(prev => ({ ...prev, comment: e.target.value }))}
            className="min-h-[100px]"
            disabled={isLoading}
          />
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end gap-2">
          <Button 
            type="button" 
            variant="outline" 
            onClick={handleReset}
            disabled={isLoading}
          >
            Reset
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Submitting...' : 'Submit'}
          </Button>
        </div>
      </div>
    </form>
  );
};

export default QuickRequestForm;
