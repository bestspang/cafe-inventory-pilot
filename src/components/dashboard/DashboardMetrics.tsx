
import React from 'react';
import { Store, Package, AlertTriangle, ClipboardCheck } from 'lucide-react';
import StatCard from '@/components/dashboard/StatCard';
import { DashboardMetrics as MetricsData } from '@/hooks/dashboard/useDashboardMetrics';

interface DashboardMetricsProps {
  metrics: MetricsData | null;
  branchTrendValues: number[];
  lowStockTrendValues: number[];
  requestsTrendValues: number[];
  stockChecksTrendValues: number[];
  isLoading: boolean;
  isOwner: boolean;
  onStatCardClick: (metric: string) => void;
}

const DashboardMetrics: React.FC<DashboardMetricsProps> = ({ 
  metrics,
  branchTrendValues,
  lowStockTrendValues,
  requestsTrendValues,
  stockChecksTrendValues,
  isLoading,
  isOwner,
  onStatCardClick
}) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <StatCard
        title="Total Branches"
        value={isOwner ? metrics?.totalBranches || 0 : 1}
        icon={<Store className="h-5 w-5" />}
        sparklineData={branchTrendValues}
        isLoading={isLoading}
        onClick={() => onStatCardClick('branches')}
      />
      <StatCard
        title="Low Stock Items"
        value={(metrics?.lowStockItems || 0).toString()}
        icon={<Package className="h-5 w-5" />}
        trend={{ value: 8, isPositive: false }}
        sparklineData={lowStockTrendValues}
        isLoading={isLoading}
        onClick={() => onStatCardClick('low-stock')}
      />
      <StatCard
        title="Pending Requests"
        value={(metrics?.pendingRequests || 0).toString()}
        icon={<ClipboardCheck className="h-5 w-5" />}
        trend={{ value: 12, isPositive: true }}
        sparklineData={requestsTrendValues}
        isLoading={isLoading}
        onClick={() => onStatCardClick('requests')}
      />
      <StatCard
        title="Missing Stock Checks"
        value={isOwner ? (metrics?.missingStockChecks || 0).toString() : "0"}
        icon={<AlertTriangle className="h-5 w-5" />}
        sparklineData={stockChecksTrendValues}
        isLoading={isLoading}
        onClick={() => onStatCardClick('stock-checks')}
      />
    </div>
  );
};

export default DashboardMetrics;
