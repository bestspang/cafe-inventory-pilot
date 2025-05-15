
import React, { useCallback, useState, useEffect } from 'react';
import { useAuth } from '@/context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useDashboardMetrics } from '@/hooks/dashboard/useDashboardMetrics';
import { useDashboardTrends } from '@/hooks/dashboard/useDashboardTrends';
import { useBranchSnapshots } from '@/hooks/dashboard/useBranchSnapshots';
import { useIntl, FormattedMessage } from 'react-intl';
import BranchesSection from '@/components/dashboard/BranchesSection';
import DashboardHeader from '@/components/dashboard/DashboardHeader';
import DashboardMetrics from '@/components/dashboard/DashboardMetrics';
import QuickActionsSection from '@/components/dashboard/QuickActionsSection';
import { useStores } from '@/context/StoresContext';
import { Button } from '@/components/ui/button';
import { PlusCircle } from 'lucide-react';

const extractNameFromEmail = (email: string): string => {
  // Extract the part before @ and capitalize the first letter
  const namePart = email.split('@')[0];
  return namePart.charAt(0).toUpperCase() + namePart.slice(1);
};

export default function Dashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [branchFilter, setBranchFilter] = useState<'all' | 'healthy' | 'at-risk'>('all');
  const intl = useIntl();
  const { stores, createStore } = useStores();
  
  const isOwner = user?.role === 'owner';
  const isManager = user?.role === 'manager';
  
  const { metrics, isLoading: isLoadingMetrics } = useDashboardMetrics();
  const { trends, isLoading: isLoadingTrends } = useDashboardTrends();
  
  // Pass the branchFilter to useBranchSnapshots
  const { branches, isLoading: isLoadingBranches } = useBranchSnapshots({ 
    branchFilter 
  });
  
  // Format the welcome message
  const welcomeName = user?.name || (user?.email ? extractNameFromEmail(user.email) : 'User');
  const welcomeMessage = intl.formatMessage(
    { id: 'dashboard.welcome', defaultMessage: 'Welcome, {name}' },
    { name: welcomeName }
  );
  const dashboardSubtitle = intl.formatMessage({ id: 'dashboard.subtitle', defaultMessage: "Here's an overview of your café operations" });
  
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

  const handleCreateFirstStore = async () => {
    try {
      const demoStoreName = `${welcomeName}'s Cafe`;
      await createStore(demoStoreName);
      // The store context will automatically refresh
    } catch (error) {
      console.error("Failed to create store:", error);
    }
  };
  
  const isLoading = isLoadingMetrics || isLoadingBranches || isLoadingTrends;

  // Extract just the values from trend data for the sparklines
  const branchTrendValues = trends.branchTrends.map(point => point.value);
  const lowStockTrendValues = trends.lowStockTrends.map(point => point.value);
  const requestsTrendValues = trends.requestsTrends.map(point => point.value);
  const stockChecksTrendValues = trends.stockChecksTrends.map(point => point.value);

  // Show an empty state if the user has no stores
  if (!isLoading && isOwner && (!stores || stores.length === 0)) {
    return (
      <div className="flex flex-col items-center justify-center h-[80vh] space-y-4 p-4 text-center">
        <div className="w-16 h-16 rounded-full bg-cafe-100 flex items-center justify-center">
          <PlusCircle className="w-8 h-8 text-cafe-700" />
        </div>
        <h1 className="text-2xl font-bold">{welcomeMessage}</h1>
        <p className="text-muted-foreground max-w-md">
          <FormattedMessage 
            id="dashboard.no.stores" 
            defaultMessage="You don't have any branches yet. Create your first branch to get started." 
          />
        </p>
        <Button onClick={handleCreateFirstStore} className="mt-4">
          <PlusCircle className="mr-2 h-4 w-4" />
          <FormattedMessage id="dashboard.create.first.branch" defaultMessage="Create Your First Branch" />
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      <DashboardHeader 
        title={welcomeMessage} 
        subtitle={dashboardSubtitle}
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
