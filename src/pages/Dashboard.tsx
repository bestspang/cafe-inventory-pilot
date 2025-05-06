
import React, { useState, useEffect } from 'react';
import { Store, Package, AlertTriangle, ClipboardCheck, Plus } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import BranchCard from '@/components/dashboard/BranchCard';
import { useAuth } from '@/context/AuthContext';
import { Skeleton } from '@/components/ui/skeleton';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { supabase } from '@/integrations/supabase/client';

// Mock data for demo purposes
const mockBranches = [
  {
    id: '1',
    name: 'Downtown Cafe',
    stockHealth: 85,
    pendingRequests: 2,
    lastCheckDate: new Date().toISOString()
  },
  {
    id: '2',
    name: 'Uptown Juice Bar',
    stockHealth: 62,
    pendingRequests: 5,
    lastCheckDate: new Date(Date.now() - 86400000).toISOString() // Yesterday
  },
  {
    id: '3',
    name: 'Riverside Cafe',
    stockHealth: 34,
    pendingRequests: 8,
    lastCheckDate: new Date(Date.now() - 86400000 * 2).toISOString() // 2 days ago
  },
  {
    id: '4',
    name: 'Airport Kiosk',
    stockHealth: 91,
    pendingRequests: 0,
    lastCheckDate: new Date().toISOString()
  }
];

// Mock trend data
const trendData = {
  branches: [4, 4, 4, 4, 4, 4, 5, 5, 5, 5, 4, 4, 4],
  lowStock: [8, 10, 12, 15, 14, 12, 10, 8, 10, 12, 12, 12, 12],
  requests: [3, 5, 7, 8, 10, 12, 15, 18, 15, 12, 10, 8, 15],
  stockChecks: [1, 2, 3, 2, 1, 0, 0, 1, 2, 3, 3, 2, 3]
};

const Dashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [isLoading, setIsLoading] = useState(true);
  const [branchFilter, setBranchFilter] = useState<'all' | 'healthy' | 'at-risk'>('all');
  
  // Simulate loading data
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);
  
  // For managers or staff, filter to show only their branch
  const filteredBranches = isOwner 
    ? mockBranches 
    : mockBranches.filter(branch => branch.id === user?.branchId);
    
  // Further filter based on branchFilter
  const displayedBranches = filteredBranches.filter(branch => {
    if (branchFilter === 'healthy') return branch.stockHealth >= 70;
    if (branchFilter === 'at-risk') return branch.stockHealth < 70;
    return true;
  });
  
  // Handler for dashboard stat card clicks
  const handleStatCardClick = (metric: string) => {
    console.log(`Clicked on ${metric} card`);
    // In future, this would open a drill-down modal
  };

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
          sparklineData={trendData.branches}
          isLoading={isLoading}
          onClick={() => handleStatCardClick('branches')}
        />
        <StatCard
          title="Low Stock Items"
          value="12"
          icon={<Package className="h-5 w-5" />}
          trend={{ value: 8, isPositive: false }}
          sparklineData={trendData.lowStock}
          isLoading={isLoading}
          onClick={() => handleStatCardClick('low-stock')}
        />
        <StatCard
          title="Pending Requests"
          value={filteredBranches.reduce((acc, branch) => acc + branch.pendingRequests, 0)}
          icon={<ClipboardCheck className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
          sparklineData={trendData.requests}
          isLoading={isLoading}
          onClick={() => handleStatCardClick('requests')}
        />
        <StatCard
          title="Missing Stock Checks"
          value={isOwner ? 3 : 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          sparklineData={trendData.stockChecks}
          isLoading={isLoading}
          onClick={() => handleStatCardClick('stock-checks')}
        />
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <QuickActions isLoading={isLoading} />
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">
            {isOwner ? 'All Branches' : 'Your Branch'}
          </h2>
          
          {isOwner && (
            <div className="flex items-center gap-2">
              <div className="flex rounded-md overflow-hidden">
                <Button 
                  variant={branchFilter === 'all' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBranchFilter('all')}
                  className="rounded-r-none"
                >
                  All
                </Button>
                <Button 
                  variant={branchFilter === 'healthy' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBranchFilter('healthy')}
                  className="rounded-none border-x-0"
                >
                  Healthy
                </Button>
                <Button 
                  variant={branchFilter === 'at-risk' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setBranchFilter('at-risk')}
                  className="rounded-l-none"
                >
                  At Risk
                </Button>
              </div>
              
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" size="sm">
                    <Plus className="h-4 w-4 mr-1" /> New
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-48 p-0">
                  <div className="p-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => console.log("New Request clicked")}>
                      New Request
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => console.log("Stock Check clicked")}>
                      Stock Check
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => console.log("Add Branch clicked")}>
                      Add Branch
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => console.log("Add Ingredient clicked")}>
                      Add Ingredient
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          )}
        </div>
        
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(isOwner ? 4 : 1)].map((_, i) => (
              <BranchCard
                key={`skeleton-${i}`}
                id={`${i}`}
                name=""
                stockHealth={0}
                pendingRequests={0}
                isLoading={true}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {displayedBranches.length === 0 ? (
              <div className="col-span-full text-center py-8 border rounded-md bg-muted/20">
                <p className="text-muted-foreground">
                  No branches match your current filter.
                </p>
                {branchFilter !== 'all' && (
                  <Button 
                    variant="link" 
                    onClick={() => setBranchFilter('all')}
                    className="mt-2"
                  >
                    View all branches
                  </Button>
                )}
              </div>
            ) : (
              displayedBranches.map((branch) => (
                <BranchCard
                  key={branch.id}
                  id={branch.id}
                  name={branch.name}
                  stockHealth={branch.stockHealth}
                  pendingRequests={branch.pendingRequests}
                  lastCheckDate={branch.lastCheckDate}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
