
import React from 'react';
import { Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from '@/hooks/use-toast';
import QuickRequestForm from '@/components/quick-request/QuickRequestForm';

const QuickRequest: React.FC = () => {
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

  return (
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
            Copy Form
          </Button>
        </div>
        
        <p className="text-muted-foreground">Request ingredients or submit stock updates</p>
        
        <div className="bg-card border rounded-lg p-6 shadow-sm">
          <QuickRequestForm />
        </div>
      </div>
    </div>
  );
};

export default QuickRequest;
