
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

interface BranchCardProps {
  id: string;
  name: string;
  stockHealth: number;
  pendingRequests: number;
}

const BranchCard: React.FC<BranchCardProps> = ({ 
  id, 
  name, 
  stockHealth, 
  pendingRequests 
}) => {
  const navigate = useNavigate();
  
  // Determine progress color based on stock health
  const getProgressColor = (health: number) => {
    if (health < 40) return 'bg-destructive';
    if (health < 70) return 'bg-yellow-500';
    return 'bg-mint-600';
  };

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-medium">{name}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        <div className="space-y-2">
          <div className="flex justify-between text-sm">
            <span>Stock Health</span>
            <span className="font-medium">{stockHealth}%</span>
          </div>
          <Progress 
            value={stockHealth} 
            className="h-2"
            indicatorClassName={getProgressColor(stockHealth)}
          />
        </div>
        <div className="flex justify-between items-center">
          <span className="text-sm">Pending Requests</span>
          <span className="font-medium bg-muted px-2 py-1 rounded-md text-xs">
            {pendingRequests}
          </span>
        </div>
      </CardContent>
      <CardFooter className="flex justify-between pt-2 border-t">
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => navigate(`/branches/${id}`)}
        >
          View Details
        </Button>
        {pendingRequests > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/requests?branch=${id}&status=pending`)}
          >
            View Requests
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BranchCard;
