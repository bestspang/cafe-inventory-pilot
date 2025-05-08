
import React from 'react';
import { useStockActivity } from '@/hooks/stock-check/useStockActivity';
import StockActivityLoading from './StockActivityLoading';
import StockActivityTable from './StockActivityTable';

const StockCheckActivity: React.FC = () => {
  const { activities, isLoading, refetchActivities } = useStockActivity();
  
  if (isLoading) {
    return <StockActivityLoading />;
  }
  
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Recent Stock Updates</h2>
      <StockActivityTable 
        activities={activities} 
        onActivityDelete={refetchActivities}
      />
    </div>
  );
};

export default StockCheckActivity;
