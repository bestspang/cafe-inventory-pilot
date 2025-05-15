
import React, { useState } from 'react';
import QuickRequestFormContainer from '@/components/quick-request/QuickRequestFormContainer';
import { StockCheckSettingsProvider } from "@/context/StockCheckSettingsContext";

const QuickRequest = () => {
  // Use an empty branch ID as default value
  const [branchId, setBranchId] = useState('');
  
  // Handle branch change
  const handleBranchChange = (newBranchId: string) => {
    console.log('Branch changed in QuickRequest page:', newBranchId);
    setBranchId(newBranchId);
  };
  
  return (
    <StockCheckSettingsProvider branchId={branchId}>
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <QuickRequestFormContainer onBranchChange={handleBranchChange} />
      </div>
    </StockCheckSettingsProvider>
  );
};

export default QuickRequest;
