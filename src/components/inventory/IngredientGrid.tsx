
import React from 'react';
import { Ingredient } from '@/types';
import IngredientCard from './IngredientCard';

interface IngredientGridProps {
  ingredients: Ingredient[];
  onEdit: (ingredient: Ingredient) => void;
  onDelete: (ingredient: Ingredient) => void;
  onViewCostHistory: (ingredient: Ingredient) => void;
}

const IngredientGrid: React.FC<IngredientGridProps> = ({ 
  ingredients, 
  onEdit, 
  onDelete, 
  onViewCostHistory 
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {ingredients.map((ingredient) => (
        <IngredientCard
          key={ingredient.id}
          ingredient={ingredient}
          onEdit={() => onEdit(ingredient)}
          onDelete={() => onDelete(ingredient)}
          onViewCostHistory={() => onViewCostHistory(ingredient)}
        />
      ))}
    </div>
  );
};

export default IngredientGrid;
