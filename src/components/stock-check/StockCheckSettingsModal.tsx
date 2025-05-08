
import React from 'react';
import { Settings } from 'lucide-react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { useStockCheckSettings } from '@/context/StockCheckSettingsContext';

interface StockCheckSettingsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const StockCheckSettingsModal: React.FC<StockCheckSettingsModalProps> = ({
  open,
  onOpenChange
}) => {
  const { showStockDetail, autoReorder, saving, update } = useStockCheckSettings();

  const handleShowStockDetailChange = async (checked: boolean) => {
    try {
      await update({ showStockDetail: checked });
    } catch (error) {
      console.error('Failed to update show stock detail setting:', error);
    }
  };

  const handleAutoReorderChange = async (checked: boolean) => {
    try {
      await update({ autoReorder: checked });
    } catch (error) {
      console.error('Failed to update auto reorder setting:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Stock Check Settings
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-6 py-4">
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="show-stock-detail">Show stock detail</Label>
              <p className="text-sm text-muted-foreground">
                In Quick Requests, show Reorder & On-hand columns when requesting ingredients.
              </p>
            </div>
            <Switch
              id="show-stock-detail"
              checked={showStockDetail}
              disabled={saving}
              onCheckedChange={handleShowStockDetailChange}
            />
          </div>
          
          <div className="flex items-center justify-between space-x-2">
            <div className="space-y-0.5">
              <Label htmlFor="auto-reorder">Auto Reorder</Label>
              <p className="text-sm text-muted-foreground">
                When stock dips below reorder point, automatically generate a PO draft.
              </p>
            </div>
            <Switch
              id="auto-reorder"
              checked={autoReorder}
              disabled={saving}
              onCheckedChange={handleAutoReorderChange}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StockCheckSettingsModal;
