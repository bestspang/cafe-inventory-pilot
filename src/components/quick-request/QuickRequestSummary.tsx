
import React from 'react';
import { QuickRequestIngredient } from '@/types/quick-request';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface QuickRequestSummaryProps {
  ingredients: QuickRequestIngredient[];
  actionType: 'request' | 'stock-update';
}

const QuickRequestSummary: React.FC<QuickRequestSummaryProps> = ({ 
  ingredients, 
  actionType 
}) => {
  // Filter ingredients that have a quantity greater than 0
  const selectedIngredients = ingredients.filter(ing => ing.quantity > 0);
  
  if (selectedIngredients.length === 0) {
    return null;
  }
  
  const title = actionType === 'request' 
    ? "Request Summary" 
    : "Stock Update Summary";
  
  const actionVerb = actionType === 'request'
    ? "requesting"
    : "updating stock for";

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm mb-2">You're {actionVerb}:</p>
        <ul className="space-y-1 list-disc list-inside">
          {selectedIngredients.map(ingredient => (
            <li key={ingredient.id} className="text-sm">
              <span className="font-medium">{ingredient.quantity}</span> × {ingredient.name} ({ingredient.unit})
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
};

export default QuickRequestSummary;
