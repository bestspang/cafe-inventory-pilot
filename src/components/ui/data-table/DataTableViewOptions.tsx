
import React from 'react';
import { LayoutGrid, LayoutList } from 'lucide-react';
import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group';

export type ViewMode = 'list' | 'grid';

interface DataTableViewOptionsProps {
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  gridViewEnabled?: boolean;
}

export const DataTableViewOptions = ({
  viewMode,
  setViewMode,
  gridViewEnabled = false
}: DataTableViewOptionsProps) => {
  return (
    <ToggleGroup 
      type="single" 
      value={viewMode} 
      onValueChange={(value) => value && setViewMode(value as ViewMode)}
      className="border rounded-md"
    >
      <ToggleGroupItem value="list" aria-label="List view">
        <LayoutList className="h-4 w-4" />
      </ToggleGroupItem>
      <ToggleGroupItem 
        value="grid" 
        aria-label="Grid view" 
        disabled={!gridViewEnabled}
      >
        <LayoutGrid className="h-4 w-4" />
      </ToggleGroupItem>
    </ToggleGroup>
  );
};
