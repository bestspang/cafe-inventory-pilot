
import React from 'react';
import { z } from 'zod';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';
import { DialogFooter } from '@/components/ui/dialog';
import { Ingredient, Category } from '@/types';
import { CategoryInput } from './CategoryInput';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.'
  }),
  categoryId: z.string({
    required_error: 'Please select a category.'
  }),
  unit: z.string().min(1, {
    message: 'Unit is required.'
  })
});

type FormValues = z.infer<typeof formSchema>;

interface IngredientFormProps {
  onSubmit: (data: Partial<Ingredient>) => Promise<void>;
  onCancel: () => void;
  ingredient?: Ingredient;
  categories: Category[];
  isSubmitting: boolean;
}

export const IngredientForm: React.FC<IngredientFormProps> = ({
  onSubmit,
  onCancel,
  ingredient,
  categories,
  isSubmitting
}) => {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: ingredient ? {
      name: ingredient.name,
      categoryId: ingredient.categoryId,
      unit: ingredient.unit
    } : {
      name: '',
      categoryId: categories.length > 0 ? categories[0].id : '',
      unit: ''
    }
  });

  const handleSubmit = async (data: FormValues) => {
    await onSubmit({
      ...data,
      id: ingredient?.id
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Coffee Beans" {...field} aria-label="Ingredient name" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <FormField
          control={form.control}
          name="categoryId"
          render={({ field }) => (
            <CategoryInput 
              categories={categories} 
              value={field.value} 
              onChange={field.onChange}
              error={form.formState.errors.categoryId?.message}
            />
          )}
        />
        
        <FormField
          control={form.control}
          name="unit"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Unit</FormLabel>
              <FormControl>
                <Input placeholder="kg, lbs, pcs" {...field} aria-label="Ingredient unit" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <DialogFooter>
          <Button 
            type="button" 
            variant="outline" 
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Saving...
              </>
            ) : ingredient ? 'Update' : 'Add'} Ingredient
          </Button>
        </DialogFooter>
      </form>
    </Form>
  );
};
