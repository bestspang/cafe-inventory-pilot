
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuickRequestFooterProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  onReset: () => void;
  onSubmit: (e: React.FormEvent) => void; // Updated to accept event
  isLoading: boolean;
}

const QuickRequestFooter: React.FC<QuickRequestFooterProps> = ({
  comment,
  onCommentChange,
  onReset,
  onSubmit,
  isLoading
}) => {
  return (
    <>
      <div>
        <Label htmlFor="comment">Comments</Label>
        <Textarea
          id="comment"
          placeholder="Add any additional information here..."
          value={comment}
          onChange={(e) => onCommentChange(e.target.value)}
          className="min-h-[100px]"
          disabled={isLoading}
        />
      </div>
      
      <div className="flex flex-col sm:flex-row justify-end gap-2">
        <Button 
          type="button" 
          variant="outline" 
          onClick={onReset}
          disabled={isLoading}
        >
          Reset
        </Button>
        <Button 
          type="submit" 
          disabled={isLoading}
          // Remove the onClick handler as we're using the form's native submit
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </>
  );
};

export default QuickRequestFooter;
