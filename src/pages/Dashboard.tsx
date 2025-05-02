
import React from 'react';
import { Store, Package, AlertTriangle, ClipboardCheck } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import BranchCard from '@/components/dashboard/BranchCard';
import { useAuth } from '@/context/AuthContext';

// Mock data for demo purposes
const mockBranches = [
  {
    id: '1',
    name: 'Downtown Cafe',
    stockHealth: 85,
    pendingRequests: 2
  },
  {
    id: '2',
    name: 'Uptown Juice Bar',
    stockHealth: 62,
    pendingRequests: 5
  },
  {
    id: '3',
    name: 'Riverside Cafe',
    stockHealth: 34,
    pendingRequests: 8
  },
  {
    id: '4',
    name: 'Airport Kiosk',
    stockHealth: 91,
    pendingRequests: 0
  }
];

const Dashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  
  // For managers or staff, filter to show only their branch
  const filteredBranches = isOwner 
    ? mockBranches 
    : mockBranches.filter(branch => branch.id === user?.branchId);

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Your inventory at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Branches"
          value={isOwner ? mockBranches.length : 1}
          icon={<Store className="h-5 w-5" />}
        />
        <StatCard
          title="Low Stock Items"
          value="12"
          icon={<Package className="h-5 w-5" />}
          trend={{ value: 8, isPositive: false }}
        />
        <StatCard
          title="Pending Requests"
          value={filteredBranches.reduce((acc, branch) => acc + branch.pendingRequests, 0)}
          icon={<ClipboardCheck className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
        />
        <StatCard
          title="Missing Stock Checks"
          value={isOwner ? 3 : 0}
          icon={<AlertTriangle className="h-5 w-5" />}
        />
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <QuickActions />
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isOwner ? 'All Branches' : 'Your Branch'}
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredBranches.map((branch) => (
            <BranchCard
              key={branch.id}
              id={branch.id}
              name={branch.name}
              stockHealth={branch.stockHealth}
              pendingRequests={branch.pendingRequests}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
