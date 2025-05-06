import React, { useState } from 'react';
import { Store, Package, AlertTriangle, ClipboardCheck, Plus } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import QuickActions from '@/components/dashboard/QuickActions';
import BranchCard from '@/components/dashboard/BranchCard';
import { useAuth } from '@/context/AuthContext';
import { Button } from '@/components/ui/button';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import { useDashboardMetrics } from '@/hooks/dashboard/useDashboardMetrics';
import { useDashboardTrends } from '@/hooks/dashboard/useDashboardTrends';
import { useBranchSnapshots } from '@/hooks/dashboard/useBranchSnapshots';

const Dashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [branchFilter, setBranchFilter] = useState<'all' | 'healthy' | 'at-risk'>('all');
  
  // Fetch metrics data from Supabase
  const { isLoading: metricsLoading, totalBranches, lowStockItems, pendingRequests, missingStockChecks } = useDashboardMetrics();
  
  // Fetch trend data for charts
  const { trends, isLoading: trendsLoading } = useDashboardTrends();
  // Safely access trend data with fallbacks
  const branchTrend = trends?.branchTrend || [];
  const lowStockTrend = trends?.lowStockTrend || [];
  const requestsTrend = trends?.requestsTrend || [];
  const stockChecksTrend = trends?.stockChecksTrend || [];
  
  // Fetch branch snapshots
  const { branches: displayedBranches, isLoading: branchesLoading } = useBranchSnapshots({ branchFilter });
  
  // Convert TrendPoint[] to number[] for StatCard sparklines
  const branchTrendValues = branchTrend.map(point => point.value);
  const lowStockTrendValues = lowStockTrend.map(point => point.value);
  const requestsTrendValues = requestsTrend.map(point => point.value);
  const stockChecksTrendValues = stockChecksTrend.map(point => point.value);
  
  // Handler for dashboard stat card clicks
  const handleStatCardClick = (metric: string) => {
    console.log(`Clicked on ${metric} card`);
    // In future, this would open a drill-down modal
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">Your inventory at a glance</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Branches"
          value={isOwner ? totalBranches : 1}
          icon={<Store className="h-5 w-5" />}
          sparklineData={branchTrendValues}
          isLoading={metricsLoading}
          onClick={() => handleStatCardClick('branches')}
        />
        <StatCard
          title="Low Stock Items"
          value={lowStockItems.toString()}
          icon={<Package className="h-5 w-5" />}
          trend={{ value: 8, isPositive: false }}
          sparklineData={lowStockTrendValues}
          isLoading={metricsLoading}
          onClick={() => handleStatCardClick('low-stock')}
        />
        <StatCard
          title="Pending Requests"
          value={pendingRequests}
          icon={<ClipboardCheck className="h-5 w-5" />}
          trend={{ value: 12, isPositive: true }}
          sparklineData={requestsTrendValues}
          isLoading={metricsLoading}
          onClick={() => handleStatCardClick('requests')}
        />
        <StatCard
          title="Missing Stock Checks"
          value={isOwner ? missingStockChecks : 0}
          icon={<AlertTriangle className="h-5 w-5" />}
          sparklineData={stockChecksTrendValues}
          isLoading={metricsLoading}
          onClick={() => handleStatCardClick('stock-checks')}
        />
      </div>

      <div className="pt-2">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-semibold">Quick Actions</h2>
        </div>
        <QuickActions isLoading={metricsLoading} />
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
        
        {branchesLoading ? (
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
