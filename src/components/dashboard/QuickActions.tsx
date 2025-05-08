
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ShoppingBag, Store, PlusCircle } from 'lucide-react';
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
  
  const isOwner = user?.role === 'owner';
  const isStaffOrManager = user?.role === 'staff' || user?.role === 'manager';

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
    <div className="flex flex-wrap gap-2">
      {isStaffOrManager && (
        <Button 
          variant="outline" 
          size="sm"
          className="group transition-all hover:bg-primary hover:text-primary-foreground"
          onClick={() => navigate('/requests/new')}
        >
          <ClipboardList className="h-4 w-4 mr-2 group-hover:text-primary-foreground transition-colors" />
          <FormattedMessage id="common.new.request" defaultMessage="New Request" />
        </Button>
      )}
      
      {isStaffOrManager && (
        <Button 
          variant="outline" 
          size="sm"
          className="group transition-all hover:bg-primary hover:text-primary-foreground"
          onClick={() => navigate('/stock-check')}
        >
          <ShoppingBag className="h-4 w-4 mr-2 group-hover:text-primary-foreground transition-colors" />
          <FormattedMessage id="stock.check.title" defaultMessage="Stock Check" />
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        className="group transition-all hover:bg-primary hover:text-primary-foreground"
        onClick={() => navigate('/quick-request')}
      >
        <PlusCircle className="h-4 w-4 mr-2 group-hover:text-primary-foreground transition-colors" />
        <FormattedMessage id="common.quick.request" defaultMessage="Quick Request" />
      </Button>
      
      {isOwner && (
        <Button 
          variant="outline" 
          size="sm"
          className="group transition-all hover:bg-primary hover:text-primary-foreground"
          onClick={() => navigate('/branches/new')}
        >
          <Store className="h-4 w-4 mr-2 group-hover:text-primary-foreground transition-colors" />
          <FormattedMessage id="common.add.branch" defaultMessage="Add Branch" />
        </Button>
      )}
    </div>
  );
};

export default QuickActions;
