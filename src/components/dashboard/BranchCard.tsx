
import React from 'react';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { HoverCard, HoverCardTrigger, HoverCardContent } from '@/components/ui/hover-card';
import { Skeleton } from '@/components/ui/skeleton';
import { FormattedMessage } from 'react-intl';

interface BranchCardProps {
  id: string;
  name: string;
  stockHealth: number;
  pendingRequests: number;
  isLoading?: boolean;
  lastCheckDate?: string;
}

const BranchCard: React.FC<BranchCardProps> = ({ 
  id, 
  name, 
  stockHealth, 
  pendingRequests,
  lastCheckDate,
  isLoading = false
}) => {
  const navigate = useNavigate();
  
  // Determine progress color based on stock health
  const getProgressColor = (health: number) => {
    if (health < 40) return 'bg-destructive';
    if (health < 70) return 'bg-yellow-500';
    return 'bg-mint-600';
  };

  // Determine status badge
  const getStatusBadge = () => {
    // If we have lastCheckDate, check if it's today
    if (lastCheckDate) {
      const today = new Date().toDateString();
      const checkDate = new Date(lastCheckDate).toDateString();
      
      if (today === checkDate) {
        return { color: 'bg-mint-600', label: 'All checks done today' };
      }
    }
    
    if (stockHealth < 40) {
      return { color: 'bg-destructive', label: 'Urgent low-stock' };
    }
    
    if (!lastCheckDate || 
       (new Date().getTime() - new Date(lastCheckDate).getTime()) > 86400000) {
      return { color: 'bg-yellow-500', label: 'Missing check' };
    }
    
    return { color: 'bg-mint-600', label: 'All checks done today' };
  };

  const status = getStatusBadge();

  if (isLoading) {
    return (
      <Card className="overflow-hidden animate-pulse">
        <CardHeader className="pb-2">
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4 pb-2">
          <div className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-2 w-full" />
          </div>
          <div className="flex justify-between items-center">
            <Skeleton className="h-4 w-28" />
            <Skeleton className="h-6 w-8 rounded-md" />
          </div>
        </CardContent>
        <CardFooter className="flex justify-between pt-2 border-t">
          <Skeleton className="h-9 w-24 rounded-md" />
          <Skeleton className="h-9 w-28 rounded-md" />
        </CardFooter>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden transition-all hover:shadow-md hover:translate-y-[-2px]">
      <CardHeader className="pb-2 flex flex-row items-center justify-between">
        <CardTitle className="text-lg font-medium">{name}</CardTitle>
        <div 
          className={`w-2.5 h-2.5 rounded-full ${status.color}`} 
          title={status.label}
        ></div>
      </CardHeader>
      <CardContent className="space-y-4 pb-2">
        <HoverCard>
          <HoverCardTrigger asChild>
            <div className="space-y-2 cursor-help">
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
          </HoverCardTrigger>
          <HoverCardContent className="w-60 p-3">
            <div className="space-y-2 text-xs">
              <h4 className="font-semibold">Stock Health Breakdown</h4>
              <div className="grid grid-cols-3 gap-2">
                <div className="flex flex-col border rounded p-1 items-center">
                  <span className="text-mint-600 font-medium">{Math.round(stockHealth * 0.7)}%</span>
                  <span className="text-muted-foreground">OK</span>
                </div>
                <div className="flex flex-col border rounded p-1 items-center">
                  <span className="text-yellow-500 font-medium">{Math.round(stockHealth * 0.2)}%</span>
                  <span className="text-muted-foreground">Reorder</span>
                </div>
                <div className="flex flex-col border rounded p-1 items-center">
                  <span className="text-destructive font-medium">{Math.round(100 - stockHealth * 0.9)}%</span>
                  <span className="text-muted-foreground">Low</span>
                </div>
              </div>
            </div>
          </HoverCardContent>
        </HoverCard>
        
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
          <FormattedMessage id="dashboard.view.details" defaultMessage="View Details" />
        </Button>
        {pendingRequests > 0 && (
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => navigate(`/requests?branch=${id}&status=pending`)}
          >
            <FormattedMessage id="dashboard.view.requests" defaultMessage="View Requests" />
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};

export default BranchCard;
