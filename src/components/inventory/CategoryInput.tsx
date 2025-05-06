
import React, { useState } from 'react';
import { FormControl, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Check, Loader2, AlertCircle, Plus, Copy } from 'lucide-react';
import { Category } from '@/types';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';

interface CategoryInputProps {
  categories: Category[];
  value: string | undefined;
  onChange: (value: string) => void;
  error?: string;
}

export const CategoryInput: React.FC<CategoryInputProps> = ({
  categories,
  value,
  onChange,
  error
}) => {
  const [showNewCategoryInput, setShowNewCategoryInput] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [categoryStatus, setCategoryStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [categoryError, setCategoryError] = useState<{title: string, message: string} | null>(null);
  const { toast } = useToast();

  const handleAddCategory = async () => {
    if (newCategoryName.trim().length < 2) {
      return;
    }
    
    try {
      setIsAddingCategory(true);
      setCategoryStatus('loading');
      setCategoryError(null);
      
      // Generate temporary ID for new category
      const tempId = `new-${Date.now()}`;
      
      // Get the handleNewCategory function from the parent component via a custom window method
      // This will be properly passed via props in a future refactoring
      const handleNewCategoryFn = window.handleNewCategory;
      
      if (!handleNewCategoryFn) {
        console.error('handleNewCategory function not available');
        setCategoryStatus('error');
        setCategoryError({
          title: "Category creation failed",
          message: "The handler function is not available"
        });
        return;
      }
      
      const newCategoryId = await handleNewCategoryFn(tempId, newCategoryName);
      
      if (!newCategoryId) {
        setCategoryStatus('error');
        setShowNewCategoryInput(true);
        setCategoryError({
          title: "Category creation failed",
          message: "Unable to create new category. Check if you have the necessary permissions."
        });
        return;
      }
      
      // Set the form value to the new category ID
      onChange(newCategoryId);
      setCategoryStatus('success');
      
      // Close new category input after a short delay to show success state
      setTimeout(() => {
        setShowNewCategoryInput(false);
        setCategoryStatus('idle');
        setNewCategoryName('');
      }, 1500);
    } catch (error: any) {
      console.error('Error adding category:', error);
      setCategoryStatus('error');
      setCategoryError({
        title: "Category creation failed",
        message: error.message || "An unexpected error occurred"
      });
    } finally {
      setIsAddingCategory(false);
    }
  };

  const copyErrorToClipboard = () => {
    if (categoryError) {
      navigator.clipboard.writeText(`${categoryError.title}: ${categoryError.message}`);
      toast({
        title: "Copied to clipboard",
        description: "Error details have been copied to your clipboard."
      });
    }
  };

  return (
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
        <div className="space-y-2">
          <div className="flex gap-2">
            <Input
              placeholder="New category name"
              value={newCategoryName}
              onChange={(e) => setNewCategoryName(e.target.value)}
              className="flex-1"
              disabled={isAddingCategory}
            />
            <Button 
              type="button" 
              size="sm"
              onClick={handleAddCategory}
              disabled={newCategoryName.trim().length < 2 || isAddingCategory}
              className="min-w-[40px]"
            >
              {categoryStatus === 'loading' ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : categoryStatus === 'success' ? (
                <Check className="h-4 w-4 text-green-500" />
              ) : categoryStatus === 'error' ? (
                <AlertCircle className="h-4 w-4 text-red-500" />
              ) : (
                <Plus className="h-4 w-4" />
              )}
            </Button>
            <Button 
              type="button" 
              variant="outline" 
              size="sm" 
              onClick={() => {
                setShowNewCategoryInput(false);
                setNewCategoryName('');
                setCategoryStatus('idle');
                setCategoryError(null);
              }}
              disabled={isAddingCategory && categoryStatus === 'loading'}
            >
              Cancel
            </Button>
          </div>
          
          {categoryStatus === 'success' && (
            <div className="text-sm text-green-600 flex items-center gap-1.5">
              <Check className="h-4 w-4" /> 
              Category added successfully
            </div>
          )}
          
          {categoryStatus === 'error' && categoryError && (
            <Alert variant="destructive" className="mb-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>{categoryError.title}</AlertTitle>
              <AlertDescription className="break-words">{categoryError.message}</AlertDescription>
              <Button 
                variant="outline" 
                size="sm" 
                className="mt-2"
                onClick={copyErrorToClipboard}
              >
                <Copy className="h-3 w-3 mr-1" /> Copy Error Details
              </Button>
            </Alert>
          )}
        </div>
      ) : (
        <Select 
          onValueChange={onChange} 
          defaultValue={value || undefined}
          value={value || undefined}
        >
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
      {error && <FormMessage>{error}</FormMessage>}
    </FormItem>
  );
};
