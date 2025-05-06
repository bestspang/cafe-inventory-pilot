
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';

const RequestsLoadingSkeleton: React.FC = () => {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ingredient Requests</h1>
          <p className="text-muted-foreground">View and manage requests from your branches</p>
        </div>
      </div>
      
      <div className="space-y-4 mt-6">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-2/3" />
        
        <div className="space-y-2 mt-6">
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
          <Skeleton className="h-16 w-full" />
        </div>
      </div>
    </div>
  );
};

export default RequestsLoadingSkeleton;
