
import React from 'react';
import { Skeleton } from '@/components/ui/skeleton';
import { ViewMode } from '@/types/inventory';

interface InventorySkeletonsProps {
  viewMode: ViewMode;
}

const InventorySkeletons: React.FC<InventorySkeletonsProps> = ({ viewMode }) => {
  return viewMode === 'grid' ? (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-md p-4 space-y-3">
          <Skeleton className="h-6 w-3/4" />
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      ))}
    </div>
  ) : (
    <div className="space-y-2">
      {[...Array(6)].map((_, i) => (
        <div key={i} className="border rounded-md p-4 flex items-center justify-between">
          <div className="space-y-2 w-full">
            <Skeleton className="h-5 w-1/3" />
            <Skeleton className="h-4 w-1/4" />
          </div>
          <Skeleton className="h-8 w-24" />
        </div>
      ))}
    </div>
  );
};

export default InventorySkeletons;
