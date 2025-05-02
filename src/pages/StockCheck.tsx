
import React, { useState } from 'react';
import { Search, Save } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Ingredient } from '@/types';

// Mock data for demo purposes
const mockIngredients: (Ingredient & { categoryName: string })[] = [
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

// Mock branch data
const mockBranches = [
  { id: '1', name: 'Downtown Cafe' },
  { id: '2', name: 'Uptown Juice Bar' },
  { id: '3', name: 'Riverside Cafe' },
  { id: '4', name: 'Airport Kiosk' },
];

interface StockItem extends Ingredient {
  categoryName: string;
  onHandQty: number;
}

const StockCheck = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [search, setSearch] = useState('');
  const [selectedBranch, setSelectedBranch] = useState(user?.branchId || '1');
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

  const getStockStatus = (item: StockItem) => {
    if (item.onHandQty <= item.defaultReorderPoint * 0.5) {
      return { label: 'Low', variant: 'destructive' as const };
    }
    if (item.onHandQty <= item.defaultReorderPoint) {
      return { label: 'Reorder', variant: 'warning' as const };
    }
    return { label: 'OK', variant: 'success' as const };
  };

  // Get available branches based on user role
  const availableBranches = user?.role === 'owner' 
    ? mockBranches 
    : mockBranches.filter(branch => branch.id === user?.branchId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Stock Check</h1>
        <p className="text-muted-foreground">Update your current inventory counts</p>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="w-full md:w-auto">
          <Select value={selectedBranch} onValueChange={setSelectedBranch}>
            <SelectTrigger className="w-full md:w-[200px]">
              <SelectValue placeholder="Select branch" />
            </SelectTrigger>
            <SelectContent>
              {availableBranches.map(branch => (
                <SelectItem key={branch.id} value={branch.id}>
                  {branch.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        
        <div className="relative w-full md:w-auto">
          <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search ingredients..." 
            className="pl-8 w-full md:w-[250px]"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ingredient</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Unit</TableHead>
              <TableHead>Reorder Point</TableHead>
              <TableHead>On-hand Qty</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredItems.map((item) => {
              const stockStatus = getStockStatus(item);
              return (
                <TableRow key={item.id} className={updatedItems[item.id] ? 'bg-green-50 dark:bg-green-900/10' : ''}>
                  <TableCell className="font-medium">{item.name}</TableCell>
                  <TableCell>{item.categoryName}</TableCell>
                  <TableCell>{item.unit}</TableCell>
                  <TableCell>{item.defaultReorderPoint}</TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      min="0"
                      value={item.onHandQty}
                      onChange={(e) => handleQuantityChange(item.id, parseInt(e.target.value) || 0)}
                      className="w-20"
                    />
                  </TableCell>
                  <TableCell>
                    <Badge variant={stockStatus.variant}>{stockStatus.label}</Badge>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>

      {filteredItems.length === 0 && (
        <div className="text-center py-8">
          <p className="text-muted-foreground">No ingredients found matching your search.</p>
        </div>
      )}

      <div className="fixed bottom-8 right-8">
        <Button onClick={handleSave} size="lg" className="shadow-lg">
          <Save className="mr-2 h-4 w-4" />
          Save Stock Check
        </Button>
      </div>
    </div>
  );
};

export default StockCheck;
