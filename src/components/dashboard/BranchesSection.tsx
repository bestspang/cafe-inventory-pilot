
import React from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover';
import BranchCard from '@/components/dashboard/BranchCard';
import { BranchSnapshot } from '@/hooks/dashboard/useBranchSnapshots';
import { useNavigate } from 'react-router-dom';
import { FormattedMessage } from 'react-intl';

interface BranchesSectionProps {
  isOwner: boolean;
  branchFilter: 'all' | 'healthy' | 'at-risk';
  setBranchFilter: (filter: 'all' | 'healthy' | 'at-risk') => void;
  displayedBranches: BranchSnapshot[];
  branchesLoading: boolean;
}

const BranchesSection: React.FC<BranchesSectionProps> = ({
  isOwner,
  branchFilter,
  setBranchFilter,
  displayedBranches,
  branchesLoading
}) => {
  const navigate = useNavigate();

  return (
    <div className="pt-2">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">
          {isOwner ? 
            <FormattedMessage id="dashboard.branches" defaultMessage="All Branches" /> : 
            <FormattedMessage id="dashboard.your.branch" defaultMessage="Your Branch" />
          }
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
                <FormattedMessage id="dashboard.all" defaultMessage="All" />
              </Button>
              <Button 
                variant={branchFilter === 'healthy' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBranchFilter('healthy')}
                className="rounded-none border-x-0"
              >
                <FormattedMessage id="dashboard.healthy" defaultMessage="Healthy" />
              </Button>
              <Button 
                variant={branchFilter === 'at-risk' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setBranchFilter('at-risk')}
                className="rounded-l-none"
              >
                <FormattedMessage id="dashboard.at.risk" defaultMessage="At Risk" />
              </Button>
            </div>
            
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-1" /> <FormattedMessage id="dashboard.new" defaultMessage="New" />
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-48 p-0">
                <div className="p-1">
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/requests/new')}>
                    <FormattedMessage id="common.new.request" defaultMessage="New Request" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/stock-check')}>
                    <FormattedMessage id="stock.check.title" defaultMessage="Stock Check" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/branches/new')}>
                    <FormattedMessage id="common.add.branch" defaultMessage="Add Branch" />
                  </Button>
                  <Button variant="ghost" size="sm" className="w-full justify-start" onClick={() => navigate('/inventory')}>
                    <FormattedMessage id="inventory.title" defaultMessage="Add Ingredient" />
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
                <FormattedMessage id="common.no.branches" defaultMessage="No branches match your current filter." />
              </p>
              {branchFilter !== 'all' && (
                <Button 
                  variant="link" 
                  onClick={() => setBranchFilter('all')}
                  className="mt-2"
                >
                  <FormattedMessage id="common.view.all.branches" defaultMessage="View all branches" />
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
  );
};

export default BranchesSection;
