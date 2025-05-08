
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { CalendarClock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { FormattedMessage } from 'react-intl';

interface QuickActionsProps {
  isLoading?: boolean;
}

const QuickActions: React.FC<QuickActionsProps> = ({ isLoading = false }) => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  if (isLoading) {
    return (
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
        <Skeleton className="h-9 w-32 rounded-md" />
      </div>
    );
  }

  return (
    <div className="flex flex-wrap gap-2 items-center py-2">
      <div className="flex items-center gap-2 text-muted-foreground">
        <CalendarClock className="h-5 w-5 text-primary/70" />
        <span className="font-medium">
          <FormattedMessage id="common.coming.soon" defaultMessage="Coming Soon" />
        </span>
      </div>
    </div>
  );
};

export default QuickActions;
