
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, Store, PlusCircle, Settings } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';

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
          New Request
        </Button>
      )}
      
      <Button 
        variant="outline" 
        size="sm"
        className="group transition-all hover:bg-primary hover:text-primary-foreground"
        onClick={() => navigate('/settings')}
      >
        <Settings className="h-4 w-4 mr-2 group-hover:text-primary-foreground transition-colors" />
        Settings
      </Button>
      
      <Button 
        variant="outline" 
        size="sm"
        className="group transition-all hover:bg-primary hover:text-primary-foreground"
        onClick={() => navigate('/quick-request')}
      >
        <PlusCircle className="h-4 w-4 mr-2 group-hover:text-primary-foreground transition-colors" />
        Quick Request
      </Button>
      
      {isOwner && (
        <Button 
          variant="outline" 
          size="sm"
          className="group transition-all hover:bg-primary hover:text-primary-foreground"
          onClick={() => navigate('/branches/new')}
        >
          <Store className="h-4 w-4 mr-2 group-hover:text-primary-foreground transition-colors" />
          Add Branch
        </Button>
      )}
    </div>
  );
};

export default QuickActions;
