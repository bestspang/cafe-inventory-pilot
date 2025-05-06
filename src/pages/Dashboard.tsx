
import React, { useCallback } from 'react';
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
  
  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'manager';
  
  const { metrics, isLoading: isLoadingMetrics } = useDashboardMetrics();
  const { 
    branchTrendValues, 
    lowStockTrendValues, 
    requestsTrendValues, 
    stockChecksTrendValues 
  } = useDashboardTrends();
  
  const { branches, isLoading: isLoadingBranches } = useBranchSnapshots();
  
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
  
  const isLoading = isLoadingMetrics || isLoadingBranches;

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
              branches={branches} 
              isLoading={isLoadingBranches} 
            />
          )}
        </div>
      </div>
    </div>
  );
}
