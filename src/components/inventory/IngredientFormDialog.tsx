
import React, { useState } from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Ingredient, Category } from '@/types';
import { useToast } from '@/hooks/use-toast';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  categoryId: z.string({
    required_error: 'Please select a category.'
  }),
  unit: z.string().min(1, {
    message: 'Unit is required.'
  }),
  defaultReorderPoint: z.coerce.number().min(0, {
    message: 'Reorder point must be a positive number.'
  })
});

type FormValues = z.infer<typeof formSchema>;

interface IngredientFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (data: FormValues) => void;
  ingredient?: Ingredient;
  categories: Category[];
}

const IngredientFormDialog: React.FC<IngredientFormDialogProps> = ({
  open,
  onOpenChange,
  onSubmit,
  ingredient,
  categories
}) => {
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: ingredient ? {
      name: ingredient.name,
      categoryId: ingredient.categoryId,
      unit: ingredient.unit,
      defaultReorderPoint: ingredient.defaultReorderPoint
    } : {
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      unit: '',
      defaultReorderPoint: 10
    }
  });

  // Reset form when dialog opens/closes or ingredient changes
  React.useEffect(() => {
    if (open) {
      form.reset(ingredient ? {
        name: ingredient.name,
        categoryId: ingredient.categoryId,
        unit: ingredient.unit,
        defaultReorderPoint: ingredient.defaultReorderPoint
      } : {
        name: '',
        categoryId: categories.length > 0 ? categories[0].id : '',
        unit: '',
        defaultReorderPoint: 10
      });
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    }
  }, [open, ingredient, categories, form]);

  const handleSubmit = async (data: FormValues) => {
    try {
      setIsSubmitting(true);
      console.log('Submitting form with data:', data);
      await onSubmit(data);
      form.reset();
      setShowNewCategoryInput(false);
      setNewCategoryName('');
    } catch (error) {
      console.error('Error submitting form:', error);
      toast({
        title: "Error",
        description: "Failed to save ingredient.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAddCategory = () => {
    if (newCategoryName.trim().length < 2) {
      toast({
        title: "Invalid category name",
        description: "Category name must be at least 2 characters.",
        variant: "destructive"
      });
      return;
    }
    
    console.log('Adding new category:', newCategoryName);
    
    // Generate temporary ID for new category (this will be properly set on the server)
    const tempId = `new-${Date.now()}`;
    
    // Add the new category to the categories array
    const newCategory = { id: tempId, name: newCategoryName };
    
    // Close new category input
    setShowNewCategoryInput(false);
    
    // Set the form value to the new category ID
    form.setValue('categoryId', tempId);
  };

  const handleFormClose = () => {
    form.reset();
    setShowNewCategoryInput(false);
    setNewCategoryName('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleFormClose}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{ingredient ? 'Edit Ingredient' : 'Add New Ingredient'}</DialogTitle>
          <DialogDescription>
            {ingredient 
              ? 'Update the details for this ingredient.' 
              : 'Add a new ingredient to your inventory.'}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Coffee Beans" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <div className="flex items-center justify-between">
                    <FormLabel>Category</FormLabel>
                    {!showNewCategoryInput && (
                      <Button 
                        type="button" 
                        variant="link" 
                        className="p-0 h-auto text-sm"
                        onClick={() => setShowNewCategoryInput(true)}
                      >
                        Create new category
                      </Button>
                    )}
                  </div>
                  
                  {showNewCategoryInput ? (
                    <div className="flex gap-2">
                      <Input
                        placeholder="New category name"
                        value={newCategoryName}
                        onChange={(e) => setNewCategoryName(e.target.value)}
                        className="flex-1"
                      />
                      <Button 
                        type="button" 
                        size="sm" 
                        onClick={handleAddCategory}
                        disabled={newCategoryName.trim().length < 2}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                      <Button 
                        type="button" 
                        variant="outline" 
                        size="sm" 
                        onClick={() => {
                          setShowNewCategoryInput(false);
                          setNewCategoryName('');
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <Select onValueChange={field.onChange} defaultValue={field.value || undefined}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map(category => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  )}
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="unit"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Unit</FormLabel>
                  <FormControl>
                    <Input placeholder="kg, lbs, pcs" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="defaultReorderPoint"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Reorder Point</FormLabel>
                  <FormControl>
                    <Input type="number" min="0" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleFormClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? 'Saving...' : ingredient ? 'Update' : 'Add'} Ingredient
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default IngredientFormDialog;
