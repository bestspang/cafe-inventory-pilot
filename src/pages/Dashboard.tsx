
import React, { useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useDashboardMetrics } from '@/hooks/dashboard/useDashboardMetrics';
import { useDashboardTrends } from '@/hooks/dashboard/useDashboardTrends';
import { useBranchSnapshots } from '@/hooks/dashboard/useBranchSnapshots';

// Dashboard Components
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import QuickActionsSection from '@/components/dashboard/QuickActionsSection';
import BranchesSection from '@/components/dashboard/BranchesSection';

const Dashboard = () => {
  const { user } = useAuth();
  const isOwner = user?.role === 'owner';
  const [branchFilter, setBranchFilter] = useState<'all' | 'healthy' | 'at-risk'>('all');
  
  // Fetch metrics data from Supabase
  const { metrics, isLoading: metricsLoading } = useDashboardMetrics();
  
  // Fetch trend data for charts
  const { trends, isLoading: trendsLoading } = useDashboardTrends();
  // Safely access trend data with fallbacks
  const branchTrends = trends?.branchTrends || [];
  const lowStockTrends = trends?.lowStockTrends || [];
  const requestsTrends = trends?.requestsTrends || [];
  const stockChecksTrends = trends?.stockChecksTrends || [];
  
  // Fetch branch snapshots
  const { branches: displayedBranches, isLoading: branchesLoading } = useBranchSnapshots({ branchFilter });
  
  // Convert TrendPoint[] to number[] for StatCard sparklines
  const branchTrendValues = branchTrends.map(point => point.value);
  const lowStockTrendValues = lowStockTrends.map(point => point.value);
  const requestsTrendValues = requestsTrends.map(point => point.value);
  const stockChecksTrendValues = stockChecksTrends.map(point => point.value);
  
  // Handler for dashboard stat card clicks
  const handleStatCardClick = (metric: string) => {
    console.log(`Clicked on ${metric} card`);
    // In future, this would open a drill-down modal
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader 
        title="Dashboard" 
        subtitle="Your inventory at a glance" 
      />

      <DashboardMetrics 
        metrics={metrics}
        branchTrendValues={branchTrendValues}
        lowStockTrendValues={lowStockTrendValues}
        requestsTrendValues={requestsTrendValues}
        stockChecksTrendValues={stockChecksTrendValues}
        isLoading={metricsLoading}
        isOwner={isOwner}
        onStatCardClick={handleStatCardClick}
      />

      <QuickActionsSection isLoading={metricsLoading} />

      <BranchesSection 
        isOwner={isOwner}
        branchFilter={branchFilter}
        setBranchFilter={setBranchFilter}
        displayedBranches={displayedBranches}
        branchesLoading={branchesLoading}
      />
    </div>
  );
};

export default Dashboard;
