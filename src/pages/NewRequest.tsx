import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Minus, X } from 'lucide-react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Card, CardContent } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Ingredient } from '@/types';

// Mock data for demo purposes
const mockBranches = [
  { id: '1', name: 'Downtown Cafe' },
  { id: '2', name: 'Uptown Juice Bar' },
  { id: '3', name: 'Riverside Cafe' },
  { id: '4', name: 'Airport Kiosk' },
];

// Update the mock ingredients to match the current StockItem type
const mockIngredients: (Ingredient & { categoryName: string })[] = [
  {
    id: '1',
    name: 'Coffee Beans',
    categoryId: '1',
    unit: 'kg',
    categoryName: 'Beverages'
  },
  {
    id: '2',
    name: 'Sugar',
    categoryId: '2',
    unit: 'kg',
    categoryName: 'Condiments'
  },
  {
    id: '3',
    name: 'Milk',
    categoryId: '1',
    unit: 'L',
    categoryName: 'Beverages'
  },
  {
    id: '4',
    name: 'Cups (Large)',
    categoryId: '3',
    unit: 'box',
    categoryName: 'Supplies'
  },
  {
    id: '5',
    name: 'Napkins',
    categoryId: '3',
    unit: 'pack',
    categoryName: 'Supplies'
  }
];

interface RequestItem {
  id: string;
  ingredientId: string;
  quantity: number;
  note: string;
}

const formSchema = z.object({
  branchId: z.string({
    required_error: "Please select a branch",
  }),
});

type FormValues = z.infer<typeof formSchema>;

const NewRequest = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [items, setItems] = useState<RequestItem[]>([
    { id: '1', ingredientId: '', quantity: 1, note: '' }
  ]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branchId: user?.branchId || '',
    },
  });

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), ingredientId: '', quantity: 1, note: '' }
    ]);
  };

  const removeItem = (id: string) => {
    if (items.length > 1) {
      setItems(items.filter(item => item.id !== id));
    }
  };

  const updateItem = (id: string, field: keyof RequestItem, value: string | number) => {
    setItems(items.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    ));
  };

  const getIngredientUnit = (ingredientId: string) => {
    const ingredient = mockIngredients.find(i => i.id === ingredientId);
    return ingredient ? ingredient.unit : '';
  };

  const onSubmit = (formData: FormValues) => {
    // Validate that all items have ingredients selected
    const hasEmptyIngredients = items.some(item => !item.ingredientId);
    
    if (hasEmptyIngredients) {
      toast({
        title: "Validation error",
        description: "Please select an ingredient for each item.",
        variant: "destructive"
      });
      return;
    }
    
    // Create the request object
    const requestData = {
      branchId: formData.branchId,
      userId: user?.id,
      requestedAt: new Date().toISOString(),
      status: 'pending',
      items: items.map(item => ({
        ingredientId: item.ingredientId,
        quantity: item.quantity,
        note: item.note
      }))
    };
    
    // Here you would typically send this to your backend
    console.log('Request data:', requestData);
    
    toast({
      title: "Request submitted",
      description: "Your ingredient request has been submitted successfully."
    });
    
    // Reset form and navigate back
    form.reset();
    setItems([{ id: '1', ingredientId: '', quantity: 1, note: '' }]);
    navigate('/requests');
  };

  // Get available branches based on user role
  const availableBranches = user?.role === 'owner' 
    ? mockBranches 
    : mockBranches.filter(branch => branch.id === user?.branchId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">New Ingredient Request</h1>
        <p className="text-muted-foreground">Request ingredients for your branch</p>
      </div>

      <Card>
        <CardContent className="pt-6">
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="branchId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Branch</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      defaultValue={field.value || (availableBranches.length > 0 ? availableBranches[0].id : undefined)}
                      disabled={user?.role !== 'owner'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a branch" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {availableBranches.map(branch => (
                          <SelectItem key={branch.id} value={branch.id}>
                            {branch.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="space-y-4">
                <h3 className="font-medium">Request Items</h3>
                
                {items.map((item, index) => (
                  <div 
                    key={item.id} 
                    className="grid grid-cols-1 md:grid-cols-[3fr,1fr,2fr,auto] gap-4 items-end"
                  >
                    <div>
                      <FormLabel htmlFor={`ingredient-${item.id}`}>Ingredient</FormLabel>
                      <Select
                        value={item.ingredientId || undefined}
                        onValueChange={(value) => updateItem(item.id, 'ingredientId', value)}
                      >
                        <SelectTrigger id={`ingredient-${item.id}`}>
                          <SelectValue placeholder="Select an ingredient" />
                        </SelectTrigger>
                        <SelectContent>
                          {mockIngredients.map(ingredient => (
                            <SelectItem key={ingredient.id} value={ingredient.id}>
                              {ingredient.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <FormLabel htmlFor={`quantity-${item.id}`}>Quantity</FormLabel>
                      <div className="flex items-center">
                        <Input
                          id={`quantity-${item.id}`}
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 1)}
                        />
                        <span className="ml-2 text-sm text-muted-foreground">
                          {item.ingredientId ? getIngredientUnit(item.ingredientId) : ''}
                        </span>
                      </div>
                    </div>
                    
                    <div>
                      <FormLabel htmlFor={`note-${item.id}`}>Note (Optional)</FormLabel>
                      <Input
                        id={`note-${item.id}`}
                        value={item.note}
                        onChange={(e) => updateItem(item.id, 'note', e.target.value)}
                        placeholder="Any special notes"
                      />
                    </div>
                    
                    <div className="flex items-center pb-1">
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                        disabled={items.length === 1}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
                
                <Button type="button" variant="outline" onClick={addItem}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Another Item
                </Button>
              </div>

              <div className="flex justify-end gap-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => navigate('/requests')}
                >
                  Cancel
                </Button>
                <Button type="submit">Submit Request</Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
};

export default NewRequest;
