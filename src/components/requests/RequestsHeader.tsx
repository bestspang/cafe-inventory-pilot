
import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

const RequestsHeader: React.FC = () => {
  const navigate = useNavigate();
  
  return (
    <div className="flex items-center justify-between">
      <div>
        <h1 className="text-2xl font-bold">Ingredient Requests</h1>
        <p className="text-muted-foreground">View and manage requests from your branches</p>
      </div>
      
      <div className="flex flex-col sm:flex-row gap-2">
        <Button variant="outline" asChild>
          <Link to="/quick-request">
            <Plus className="h-4 w-4 mr-2" />
            Quick Request
          </Link>
        </Button>
        
        <Button onClick={() => navigate('/requests/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>
    </div>
  );
};

export default RequestsHeader;
