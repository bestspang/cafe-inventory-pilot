
import React from 'react';
import QuickRequestForm from '@/components/quick-request/QuickRequestForm';

const QuickRequest: React.FC = () => {
  return (
    <div className="container py-8 mx-auto max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold">Quick Ingredient Requests</h1>
          <p className="text-muted-foreground">Request ingredients or submit stock updates</p>
        </div>
        
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <QuickRequestForm />
        </div>
      </div>
    </div>
  );
};

export default QuickRequest;
