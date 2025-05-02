
import React, { useState } from 'react';
import { Plus, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import IngredientCard from '@/components/inventory/IngredientCard';
import IngredientFormDialog from '@/components/inventory/IngredientFormDialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Ingredient, Category } from '@/types';

// Mock data for demo purposes
const mockCategories: Category[] = [
  { id: '1', name: 'Dairy' },
  { id: '2', name: 'Produce' },
  { id: '3', name: 'Coffee & Tea' },
  { id: '4', name: 'Bakery' },
  { id: '5', name: 'Packaging' }
];

const mockIngredients: (Ingredient & { categoryName: string, onHandQty?: number })[] = [
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

const Inventory = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [ingredients, setIngredients] = useState(mockIngredients);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  
  const [formDialogOpen, setFormDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [currentIngredient, setCurrentIngredient] = useState<Ingredient | undefined>(undefined);
  
  // Only owners and managers can modify ingredients
  const canModify = ['owner', 'manager'].includes(user?.role || '');

  // Filter ingredients based on search and category
  const filteredIngredients = ingredients.filter(ingredient => {
    const matchesSearch = ingredient.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter ? ingredient.categoryId === categoryFilter : true;
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

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Inventory Management</h1>
        <p className="text-muted-foreground">
          {canModify 
            ? 'Add, edit, and manage your inventory ingredients.' 
            : 'View your inventory ingredients.'
          }
        </p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-auto flex-1 md:max-w-sm">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search ingredients..." 
            className="pl-8"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        
        <div className="flex gap-2 w-full md:w-auto">
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-full md:w-[180px]">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Categories</SelectItem>
              {mockCategories.map(category => (
                <SelectItem key={category.id} value={category.id}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {canModify && (
            <Button onClick={() => {
              setCurrentIngredient(undefined);
              setFormDialogOpen(true);
            }}>
              <Plus className="h-4 w-4 mr-1" />
              Add Ingredient
            </Button>
          )}
        </div>
      </div>

      {filteredIngredients.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredIngredients.map((ingredient) => (
            <IngredientCard
              key={ingredient.id}
              ingredient={ingredient}
              onEdit={() => handleEdit(ingredient)}
              onDelete={() => handleDelete(ingredient)}
            />
          ))}
        </div>
      ) : (
        <div className="text-center py-12 border border-dashed rounded-lg">
          <p className="text-muted-foreground">No ingredients found.</p>
          {search || categoryFilter ? (
            <p className="text-sm mt-2">
              Try adjusting your search or filter criteria.
            </p>
          ) : canModify ? (
            <Button 
              variant="link" 
              onClick={() => {
                setCurrentIngredient(undefined);
                setFormDialogOpen(true);
              }}
            >
              Add your first ingredient
            </Button>
          ) : null}
        </div>
      )}
      
      {/* Add/Edit Ingredient Dialog */}
      <IngredientFormDialog
        open={formDialogOpen}
        onOpenChange={setFormDialogOpen}
        onSubmit={handleAddEdit}
        ingredient={currentIngredient}
        categories={mockCategories}
      />
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete {currentIngredient?.name} from your inventory.
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-destructive text-destructive-foreground">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Inventory;
