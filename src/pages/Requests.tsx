
import React, { useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Search, Filter, Plus, Check, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger
} from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/context/AuthContext';
import { Request } from '@/types';

// Mock data for demo purposes
const mockRequests: (Request & { 
  branchName: string; 
  userName: string;
  itemsCount: number;
  detailText: string;
})[] = [
  {
    id: '1',
    branchId: '1',
    branchName: 'Downtown Cafe',
    userId: '3',
    userName: 'Mike Staff',
    requestedAt: '2023-05-02T10:30:00Z',
    status: 'pending',
    itemsCount: 3,
    detailText: 'Coffee Beans (5kg), Milk (10L), Sugar (2kg)',
    items: []
  },
  {
    id: '2',
    branchId: '2',
    branchName: 'Uptown Juice Bar',
    userId: '4',
    userName: 'Jane Staff',
    requestedAt: '2023-05-01T14:45:00Z',
    status: 'fulfilled',
    itemsCount: 2,
    detailText: 'Avocados (20pcs), Lemons (30pcs)',
    items: []
  },
  {
    id: '3',
    branchId: '1',
    branchName: 'Downtown Cafe',
    userId: '3',
    userName: 'Mike Staff',
    requestedAt: '2023-04-29T09:15:00Z',
    status: 'pending',
    itemsCount: 1,
    detailText: 'To-Go Cups (3 boxes)',
    items: []
  },
  {
    id: '4',
    branchId: '3',
    branchName: 'Riverside Cafe',
    userId: '5',
    userName: 'Alex Staff',
    requestedAt: '2023-04-28T16:20:00Z',
    status: 'pending',
    itemsCount: 4,
    detailText: 'Napkins (5 packs), Straws (2 boxes), Coffee Filters (3 boxes), Tea bags (10 packs)',
    items: []
  },
  {
    id: '5',
    branchId: '4',
    branchName: 'Airport Kiosk',
    userId: '6',
    userName: 'Sam Staff',
    requestedAt: '2023-04-25T11:05:00Z',
    status: 'fulfilled',
    itemsCount: 2,
    detailText: 'Coffee Beans (2kg), Pastries (20pcs)',
    items: []
  }
];

// Mock branch data
const mockBranches = [
  { id: '1', name: 'Downtown Cafe' },
  { id: '2', name: 'Uptown Juice Bar' },
  { id: '3', name: 'Riverside Cafe' },
  { id: '4', name: 'Airport Kiosk' },
];

const Requests = () => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // Initialize state from URL parameters
  const initialStatus = searchParams.get('status') || 'all';
  const initialBranch = searchParams.get('branch') || (user?.role === 'owner' ? 'all' : user?.branchId || 'all');
  
  const [status, setStatus] = useState<'all' | 'pending' | 'fulfilled'>(initialStatus as any);
  const [selectedBranch, setSelectedBranch] = useState(initialBranch);
  const [search, setSearch] = useState('');
  const [requests, setRequests] = useState(mockRequests);

  // Filter requests based on user role, branch, status and search
  const filteredRequests = requests.filter(request => {
    // Filter by user role and branch
    if (user?.role !== 'owner' && request.branchId !== user?.branchId) {
      return false;
    }
    
    // Filter by selected branch
    if (selectedBranch && selectedBranch !== 'all' && request.branchId !== selectedBranch) {
      return false;
    }
    
    // Filter by status
    if (status !== 'all' && request.status !== status) {
      return false;
    }
    
    // Filter by search term
    if (search && !request.detailText.toLowerCase().includes(search.toLowerCase())) {
      return false;
    }
    
    return true;
  });

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };

  const handleToggleStatus = (requestId: string) => {
    setRequests(prev => prev.map(request => {
      if (request.id === requestId) {
        const newStatus = request.status === 'pending' ? 'fulfilled' : 'pending';
        
        toast({
          title: `Request ${newStatus === 'fulfilled' ? 'fulfilled' : 'reopened'}`,
          description: `Request #${requestId} has been ${newStatus === 'fulfilled' ? 'marked as fulfilled' : 'reopened'}.`
        });
        
        return {
          ...request,
          status: newStatus as 'pending' | 'fulfilled'
        };
      }
      return request;
    }));
  };

  // Get available branches based on user role
  const availableBranches = user?.role === 'owner' 
    ? mockBranches 
    : mockBranches.filter(branch => branch.id === user?.branchId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ingredient Requests</h1>
          <p className="text-muted-foreground">View and manage requests from your branches</p>
        </div>
        
        <Button onClick={() => navigate('/requests/new')}>
          <Plus className="h-4 w-4 mr-2" />
          New Request
        </Button>
      </div>

      <Tabs defaultValue={status} onValueChange={(v) => setStatus(v as any)}>
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-4">
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
          </TabsList>
          
          <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
            {user?.role === 'owner' && (
              <Select value={selectedBranch} onValueChange={setSelectedBranch}>
                <SelectTrigger className="w-full md:w-[180px]">
                  <SelectValue placeholder="All Branches" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Branches</SelectItem>
                  {availableBranches.map(branch => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            
            <div className="relative w-full md:w-auto">
              <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input 
                placeholder="Search items..." 
                className="pl-8 w-full md:w-[250px]"
                value={search}
                onChange={e => setSearch(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <TabsContent value="all" className="mt-0">
          <RequestsTable 
            requests={filteredRequests} 
            onToggleStatus={handleToggleStatus} 
            showBranch={user?.role === 'owner'} 
          />
        </TabsContent>
        
        <TabsContent value="pending" className="mt-0">
          <RequestsTable 
            requests={filteredRequests} 
            onToggleStatus={handleToggleStatus} 
            showBranch={user?.role === 'owner'} 
          />
        </TabsContent>
        
        <TabsContent value="fulfilled" className="mt-0">
          <RequestsTable 
            requests={filteredRequests} 
            onToggleStatus={handleToggleStatus} 
            showBranch={user?.role === 'owner'} 
          />
        </TabsContent>
      </Tabs>
    </div>
  );
};

interface RequestsTableProps {
  requests: (Request & { 
    branchName: string; 
    userName: string;
    itemsCount: number;
    detailText: string;
  })[];
  onToggleStatus: (id: string) => void;
  showBranch: boolean;
}

const RequestsTable: React.FC<RequestsTableProps> = ({ 
  requests, 
  onToggleStatus,
  showBranch
}) => {
  const { user } = useAuth();
  const canFulfill = ['owner', 'manager'].includes(user?.role || '');
  
  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    }).format(date);
  };
  
  if (requests.length === 0) {
    return (
      <div className="text-center py-12 border rounded-lg">
        <p className="text-muted-foreground">No requests found.</p>
      </div>
    );
  }
  
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[100px]">Date</TableHead>
            {showBranch && <TableHead>Branch</TableHead>}
            <TableHead>Requested By</TableHead>
            <TableHead>Items</TableHead>
            <TableHead>Status</TableHead>
            {canFulfill && <TableHead className="text-right">Actions</TableHead>}
          </TableRow>
        </TableHeader>
        <TableBody>
          {requests.map((request) => (
            <TableRow key={request.id}>
              <TableCell className="font-medium">
                {formatDate(request.requestedAt)}
              </TableCell>
              
              {showBranch && (
                <TableCell>{request.branchName}</TableCell>
              )}
              
              <TableCell>{request.userName}</TableCell>
              
              <TableCell>
                <div className="flex items-center gap-2">
                  <span>{request.itemsCount} items</span>
                  <Badge variant="outline" className="cursor-help" title={request.detailText}>
                    Details
                  </Badge>
                </div>
              </TableCell>
              
              <TableCell>
                <Badge variant={request.status === 'pending' ? 'warning' : 'success'}>
                  {request.status === 'pending' ? 'Pending' : 'Fulfilled'}
                </Badge>
              </TableCell>
              
              {canFulfill && (
                <TableCell className="text-right">
                  <Button
                    variant={request.status === 'pending' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => onToggleStatus(request.id)}
                  >
                    {request.status === 'pending' ? (
                      <>
                        <Check className="h-4 w-4 mr-1" />
                        Mark Fulfilled
                      </>
                    ) : (
                      <>
                        <X className="h-4 w-4 mr-1" />
                        Reopen
                      </>
                    )}
                  </Button>
                </TableCell>
              )}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};

export default Requests;
