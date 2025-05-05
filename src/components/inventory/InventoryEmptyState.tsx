
import React from 'react';
import { Button } from '@/components/ui/button';

interface InventoryEmptyStateProps {
  hasFilters: boolean;
  canModify: boolean;
  onAddIngredient: () => void;
}

const InventoryEmptyState: React.FC<InventoryEmptyStateProps> = ({ hasFilters, canModify, onAddIngredient }) => {
  return (
    <div className="text-center py-12 border border-dashed rounded-lg">
      <p className="text-muted-foreground">No ingredients found.</p>
      {hasFilters ? (
        <p className="text-sm mt-2">
          Try adjusting your search or filter criteria.
        </p>
      ) : canModify ? (
        <Button 
          variant="link" 
          onClick={onAddIngredient}
        >
          Add your first ingredient
        </Button>
      ) : null}
    </div>
  );
};

export default InventoryEmptyState;
