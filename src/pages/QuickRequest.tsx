
import React from 'react';
import QuickRequestFormContainer from '@/components/quick-request/QuickRequestFormContainer';
import { StockCheckSettingsProvider } from "@/context/StockCheckSettingsContext";

const QuickRequest = () => {
  // Use an empty branch ID as default value
  const defaultBranchId = '';
  
  return (
    <StockCheckSettingsProvider branchId={defaultBranchId}>
      <div className="min-h-screen bg-muted/30 flex flex-col">
        <QuickRequestFormContainer />
      </div>
    </StockCheckSettingsProvider>
  );
};

export default QuickRequest;
