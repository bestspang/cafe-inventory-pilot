
import { useState } from 'react';
import { useToast } from '@/hooks/use-toast';
import { StockItem } from '@/types/stock-check';

// Mock data for demo purposes
const mockIngredients: (Omit<StockItem, 'onHandQty'> & { categoryName: string })[] = [
  { 
    id: '1', 
    name: 'Coffee Beans', 
    categoryId: '3', 
    categoryName: 'Coffee & Tea',
    unit: 'kg', 
    defaultReorderPoint: 5
  },
  { 
    id: '2', 
    name: 'Whole Milk', 
    categoryId: '1',
    categoryName: 'Dairy', 
    unit: 'liter', 
    defaultReorderPoint: 10
  },
  { 
    id: '3', 
    name: 'Avocado', 
    categoryId: '2',
    categoryName: 'Produce', 
    unit: 'pcs', 
    defaultReorderPoint: 15
  },
  { 
    id: '4', 
    name: 'Croissant', 
    categoryId: '4',
    categoryName: 'Bakery', 
    unit: 'pcs', 
    defaultReorderPoint: 20
  },
  { 
    id: '5', 
    name: 'To-Go Cups (12oz)', 
    categoryId: '5',
    categoryName: 'Packaging', 
    unit: 'box', 
    defaultReorderPoint: 3
  },
];

export const useStockCheck = () => {
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState('1');
  const [stockItems, setStockItems] = useState<StockItem[]>(
    mockIngredients.map(ingredient => ({
      ...ingredient,
      onHandQty: Math.floor(Math.random() * 20) // Random initial values for demo
    }))
  );
  const [updatedItems, setUpdatedItems] = useState<Record<string, boolean>>({});

  // Filter ingredients based on search
  const filteredItems = stockItems.filter(item => 
    item.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleQuantityChange = (id: string, quantity: number) => {
    setStockItems(prev => 
      prev.map(item => 
        item.id === id ? { ...item, onHandQty: quantity } : item
      )
    );
    setUpdatedItems(prev => ({ ...prev, [id]: true }));
  };

  const handleSave = () => {
    // Here you would typically send the data to your backend
    toast({
      title: "Stock check saved",
      description: "Your inventory counts have been updated successfully."
    });
    setUpdatedItems({});
  };

  return {
    search,
    setSearch,
    selectedBranch,
    setSelectedBranch,
    stockItems,
    filteredItems,
    updatedItems,
    handleQuantityChange,
    handleSave
  };
};
