
import React from 'react';
import { DataTableToolbar } from '@/components/ui/data-table/DataTableToolbar';
import { RequestFilters } from '@/hooks/requests/useRequestsFilters';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/data-table/DateRangePicker';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';

interface RequestsFilterProps {
  filters: RequestFilters;
  setFilters: (filters: RequestFilters) => void;
  branches: { id: string, name: string }[];
  resetFilters: () => void;
  activeFilterCount: number;
  showBranchSelector: boolean;
}

const RequestsFilters: React.FC<RequestsFilterProps> = ({
  filters,
  setFilters,
  branches,
  resetFilters,
  activeFilterCount,
  showBranchSelector
}) => {
  return (
    <div className="sticky top-0 z-10 bg-background py-4 border-b mb-4">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-4">
        <Tabs 
          value={filters.status} 
          onValueChange={(value) => setFilters({ ...filters, status: value as RequestFilters['status'] })}
          className="w-full md:w-auto"
        >
          <TabsList>
            <TabsTrigger value="all">All Requests</TabsTrigger>
            <TabsTrigger value="pending">Pending</TabsTrigger>
            <TabsTrigger value="fulfilled">Fulfilled</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      <DataTableToolbar
        filters={filters}
        setFilters={setFilters}
        searchPlaceholder="Search by staff or items..."
        filterCount={activeFilterCount}
        onResetFilters={resetFilters}
      >
        {showBranchSelector && (
          <div>
            <label className="text-sm font-medium block mb-2">Branch</label>
            <Select
              value={filters.branchId}
              onValueChange={(value) => setFilters({ ...filters, branchId: value })}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select branch" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Branches</SelectItem>
                {branches.map((branch) => (
                  <SelectItem key={branch.id} value={branch.id}>
                    {branch.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}
        
        <div>
          <label className="text-sm font-medium block mb-2">Date Range</label>
          <DateRangePicker 
            dateRange={filters.dateRange}
            setDateRange={(range) => setFilters({ ...filters, dateRange: range })}
            className="w-full"
          />
        </div>
      </DataTableToolbar>
    </div>
  );
};

export default RequestsFilters;
