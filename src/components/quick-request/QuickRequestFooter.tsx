
import React from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';

interface QuickRequestFooterProps {
  comment: string;
  onCommentChange: (comment: string) => void;
  onReset: () => void;
  onSubmit: () => void;
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
          onClick={onSubmit}
        >
          {isLoading ? 'Submitting...' : 'Submit'}
        </Button>
      </div>
    </>
  );
};

export default QuickRequestFooter;
