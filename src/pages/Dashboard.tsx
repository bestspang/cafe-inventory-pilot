
import React, { useCallback, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboardMetrics } from '@/hooks/dashboard/useDashboardMetrics';
import { useDashboardTrends } from '@/hooks/dashboard/useDashboardTrends';
import { useBranchSnapshots } from '@/hooks/dashboard/useBranchSnapshots';
import BranchesSection from '@/components/dashboard/BranchesSection';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import QuickActionsSection from '@/components/dashboard/QuickActionsSection';

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [branchFilter, setBranchFilter] = useState<'all' | 'healthy' | 'at-risk'>('all');
  
  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'manager';
  
  const { metrics, isLoading: isLoadingMetrics } = useDashboardMetrics();
  const { trends, isLoading: isLoadingTrends } = useDashboardTrends();
  
  const { branches, isLoading: isLoadingBranches } = useBranchSnapshots({ 
    branchFilter 
  });
  
  const handleStatCardClick = useCallback((metric: string) => {
    switch (metric) {
      case 'branches':
        navigate('/branches');
        break;
      case 'low-stock':
        navigate('/inventory?filter=low-stock');
        break;
      case 'requests':
        navigate('/requests?status=pending');
        break;
      case 'stock-checks':
        navigate('/stock-check');
        break;
      default:
        break;
    }
  }, [navigate]);
  
  const isLoading = isLoadingMetrics || isLoadingBranches || isLoadingTrends;

  // Extract just the values from trend data for the sparklines
  const branchTrendValues = trends.branchTrends.map(point => point.value);
  const lowStockTrendValues = trends.lowStockTrends.map(point => point.value);
  const requestsTrendValues = trends.requestsTrends.map(point => point.value);
  const stockChecksTrendValues = trends.stockChecksTrends.map(point => point.value);

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader 
        title={`Welcome, ${user?.name || 'User'}`} 
        subtitle="Here's an overview of your café operations"
      />
      
      <DashboardMetrics
        metrics={metrics}
        branchTrendValues={branchTrendValues}
        lowStockTrendValues={lowStockTrendValues}
        requestsTrendValues={requestsTrendValues}
        stockChecksTrendValues={stockChecksTrendValues}
        isLoading={isLoading}
        isOwner={isOwner}
        onStatCardClick={handleStatCardClick}
      />
      
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 space-y-6">
          {(isOwner || isManager) && (
            <QuickActionsSection isLoading={isLoading} />
          )}
        </div>
        
        <div className="xl:col-span-3 space-y-6">
          {isOwner && (
            <BranchesSection 
              isOwner={isOwner}
              branchFilter={branchFilter}
              setBranchFilter={setBranchFilter}
              displayedBranches={branches}
              branchesLoading={isLoadingBranches}
            />
          )}
        </div>
      </div>
    </div>
  );
}
