
import React from 'react';
import { Loader2 } from 'lucide-react';

const QuickRequestFormLoading: React.FC = () => {
  return (
    <div className="text-center p-8">
      <Loader2 className="h-8 w-8 animate-spin mx-auto mb-2" />
      <p className="text-muted-foreground">Loading ingredients...</p>
    </div>
  );
};

export default QuickRequestFormLoading;
