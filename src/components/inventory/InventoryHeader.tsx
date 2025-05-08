
import React from 'react';
import { Archive } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface InventoryHeaderProps {
  canModify: boolean;
  onOpenArchives: () => void;
}

const InventoryHeader: React.FC<InventoryHeaderProps> = ({ canModify, onOpenArchives }) => {
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Global Ingredient Registry</h1>
        <p className="text-muted-foreground">
          {canModify 
            ? 'Add, edit, and manage your global ingredient list.' 
            : 'View the global ingredient list.'
          }
        </p>
      </div>
      
      {canModify && (
        <Button 
          variant="outline"
          size="sm"
          className="gap-1"
          onClick={onOpenArchives}
        >
          <Archive className="h-4 w-4" />
          Archives
        </Button>
      )}
    </div>
  );
};

export default InventoryHeader;
