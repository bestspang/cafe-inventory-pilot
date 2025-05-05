
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Ingredient, Category } from '@/types';
import { StockItem } from '@/types/stock-check';

// Mock data for demo purposes
const mockCategories: Category[] = [
  { id: '1', name: 'Dairy' },
  { id: '2', name: 'Produce' },
  { id: '3', name: 'Coffee & Tea' },
  { id: '4', name: 'Bakery' },
  { id: '5', name: 'Packaging' }
];

const mockIngredients: StockItem[] = [
  { 
    id: '1', 
    name: 'Coffee Beans', 
    categoryId: '3', 
    categoryName: 'Coffee & Tea',
    unit: 'kg', 
    defaultReorderPoint: 5,
    onHandQty: 8
  },
  { 
    id: '2', 
    name: 'Whole Milk', 
    categoryId: '1',
    categoryName: 'Dairy', 
    unit: 'liter', 
    defaultReorderPoint: 10,
    onHandQty: 6
  },
  { 
    id: '3', 
    name: 'Avocado', 
    categoryId: '2',
    categoryName: 'Produce', 
    unit: 'pcs', 
    defaultReorderPoint: 15,
    onHandQty: 4
  },
  { 
    id: '4', 
    name: 'Croissant', 
    categoryId: '4',
    categoryName: 'Bakery', 
    unit: 'pcs', 
    defaultReorderPoint: 20,
    onHandQty: 12
  },
  { 
    id: '5', 
    name: 'To-Go Cups (12oz)', 
    categoryId: '5',
    categoryName: 'Packaging', 
    unit: 'box', 
    defaultReorderPoint: 3,
    onHandQty: 1
  },
];

export const useInventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState<StockItem[]>(mockIngredients);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | undefined>(undefined);
  
  // Only owners and managers can modify ingredients
  const canModify = ['owner', 'manager'].includes(user?.role || '');

  // Filter ingredients based on search and category
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'all' ? true : ingredient.categoryId === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddEdit = (data: Partial<Ingredient>) => {
    if (currentIngredient) {
      // Edit existing ingredient
      setIngredients(prev => 
        prev.map(item => 
          item.id === currentIngredient.id 
            ? { 
                ...item, 
                ...data,
                categoryName: mockCategories.find(c => c.id === data.categoryId)?.name || item.categoryName
              } 
            : item
        )
      );
      
      toast({
        title: "Ingredient updated",
        description: `${data.name} has been updated successfully.`
      });
    } else {
      // Add new ingredient
      const newIngredient = {
        id: Date.now().toString(),
        name: data.name!,
        categoryId: data.categoryId!,
        categoryName: mockCategories.find(c => c.id === data.categoryId)?.name || '',
        unit: data.unit!,
        defaultReorderPoint: data.defaultReorderPoint!,
        onHandQty: 0
      };
      
      setIngredients(prev => [...prev, newIngredient]);
      
      toast({
        title: "Ingredient added",
        description: `${data.name} has been added to your inventory.`
      });
    }
    
    setCurrentIngredient(undefined);
  };

  const handleEdit = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setFormDialogOpen(true);
  };

  const handleDelete = (ingredient: Ingredient) => {
    setCurrentIngredient(ingredient);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (currentIngredient) {
      setIngredients(prev => prev.filter(item => item.id !== currentIngredient.id));
      
      toast({
        title: "Ingredient deleted",
        description: `${currentIngredient.name} has been removed from your inventory.`,
        variant: "destructive"
      });
      
      setCurrentIngredient(undefined);
      setDeleteDialogOpen(false);
    }
  };

  return {
    ingredients: filteredIngredients,
    search,
    setSearch,
    categoryFilter,
    setCategoryFilter,
    formDialogOpen,
    setFormDialogOpen,
    deleteDialogOpen,
    setDeleteDialogOpen,
    currentIngredient,
    setCurrentIngredient,
    canModify,
    categories: mockCategories,
    handleAddEdit,
    handleEdit,
    handleDelete,
    confirmDelete,
    hasFilters: search !== '' || categoryFilter !== 'all'
  };
};
