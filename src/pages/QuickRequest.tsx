
import React, { useState } from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import QuickRequestForm from '@/components/quick-request/QuickRequestForm';
import { StockCheckSettingsProvider } from '@/context/StockCheckSettingsContext';

const QuickRequest: React.FC = () => {
  const [selectedBranch, setSelectedBranch] = useState<string>('');
  
  const copyFormLink = () => {
    // Get the current URL
    const formUrl = window.location.href;
    
    // Copy URL to clipboard
    navigator.clipboard.writeText(formUrl)
      .then(() => {
        toast({
          title: "Link copied",
          description: "Form link copied to clipboard",
        });
      })
      .catch((error) => {
        console.error('Error copying form link:', error);
        toast({
          title: "Failed to copy",
          description: "Could not copy the form link to clipboard",
          variant: "destructive"
        });
      });
  };

  const handleBranchChange = (branchId: string) => {
    setSelectedBranch(branchId);
  };

  return (
    <StockCheckSettingsProvider branchId={selectedBranch}>
      <div className="container py-8 mx-auto max-w-4xl">
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Quick Ingredient Requests</h1>
            <Button 
              variant="outline" 
              onClick={copyFormLink}
              className="flex items-center gap-2"
            >
              <Copy size={16} />
              Copy Form Link
            </Button>
          </div>
          
          <p className="text-muted-foreground">
            This public form allows staff to request ingredients or submit stock updates without logging in.
            Simply select your store, staff name, and provide the necessary information.
          </p>
          
          <div className="bg-card border rounded-lg p-6 shadow-sm">
            <QuickRequestForm onBranchChange={handleBranchChange} />
          </div>
        </div>
      </div>
    </StockCheckSettingsProvider>
  );
};

export default QuickRequest;
