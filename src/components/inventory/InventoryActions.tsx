
import React from 'react';
import { Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Branch } from '@/types';

interface InventoryActionsProps {
  stores: Branch[];
  currentStoreId: string | null;
  onStoreChange: (storeId: string) => void;
  onOpenSettings: () => void;
  onOpenArchives: () => void;
  canModify: boolean;
}

const InventoryActions: React.FC<InventoryActionsProps> = ({
  stores,
  currentStoreId,
  onStoreChange,
  onOpenSettings,
  onOpenArchives,
  canModify
}) => {
  return (
    <div className="flex items-center gap-2">
      <Select 
        value={currentStoreId || ''} 
        onValueChange={onStoreChange}
      >
        <SelectTrigger className="w-[180px]">
          <SelectValue placeholder="Select store" />
        </SelectTrigger>
        <SelectContent>
          {stores.map(store => (
            <SelectItem key={store.id} value={store.id}>
              {store.name}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>

      {canModify && (
        <>
          <Button 
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={onOpenArchives}
          >
            Archives
          </Button>
          
          <Button
            variant="outline"
            size="sm"
            className="gap-1"
            onClick={onOpenSettings}
          >
            <Settings className="h-4 w-4" />
            Settings
          </Button>
        </>
      )}
    </div>
  );
};

export default InventoryActions;
