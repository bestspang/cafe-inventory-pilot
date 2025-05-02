
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ClipboardList, ShoppingBag, Store } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/context/AuthContext';

const QuickActions: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const isOwner = user?.role === 'owner';
  const isStaffOrManager = user?.role === 'staff' || user?.role === 'manager';

  return (
    <div className="flex flex-wrap gap-2">
      {isStaffOrManager && (
        <Button 
          variant="outline" 
          size="sm"
          className="group"
          onClick={() => navigate('/requests/new')}
        >
          <ClipboardList className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
          New Request
        </Button>
      )}
      
      {isStaffOrManager && (
        <Button 
          variant="outline" 
          size="sm"
          className="group"
          onClick={() => navigate('/stock-check')}
        >
          <ShoppingBag className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
          Stock Check
        </Button>
      )}
      
      {isOwner && (
        <Button 
          variant="outline" 
          size="sm"
          className="group"
          onClick={() => navigate('/branches/new')}
        >
          <Store className="h-4 w-4 mr-2 group-hover:text-primary transition-colors" />
          Add Branch
        </Button>
      )}
    </div>
  );
};

export default QuickActions;
