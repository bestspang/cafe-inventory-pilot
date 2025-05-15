
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface InventorySettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  storeId: string | null | undefined;
}

interface InventorySettings {
  autoReorder: boolean;
  showLowStockWarnings: boolean;
}

const InventorySettingsDialog: React.FC<InventorySettingsProps> = ({ 
  open, 
  onOpenChange,
  storeId
}) => {
  const { toast } = useToast();
  const [settings, setSettings] = useState<InventorySettings>({
    autoReorder: false,
    showLowStockWarnings: true,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchSettings = async () => {
      if (!storeId) return;

      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('stock_check_settings')
          .select('*')
          .eq('branch_id', storeId)
          .single();

        if (error && error.code !== 'PGRST116') { // Not found error code
          throw error;
        }

        if (data) {
          setSettings({
            autoReorder: data.auto_reorder,
            showLowStockWarnings: data.show_stock_detail,
          });
        }
      } catch (error) {
        console.error('Error fetching inventory settings:', error);
        toast({
          title: 'Error',
          description: 'Failed to load inventory settings',
          variant: 'destructive',
        });
      } finally {
        setIsLoading(false);
      }
    };

    if (open && storeId) {
      fetchSettings();
    }
  }, [open, storeId, toast]);

  const handleSaveSettings = async () => {
    if (!storeId) {
      toast({
        title: 'Error',
        description: 'No store selected',
        variant: 'destructive',
      });
      return;
    }

    setIsSaving(true);
    try {
      // Check if settings exist for this branch
      const { data: existingSettings, error: checkError } = await supabase
        .from('stock_check_settings')
        .select('id')
        .eq('branch_id', storeId)
        .single();

      if (checkError && checkError.code !== 'PGRST116') {
        throw checkError;
      }

      let result;
      if (existingSettings) {
        // Update existing settings
        result = await supabase
          .from('stock_check_settings')
          .update({
            auto_reorder: settings.autoReorder,
            show_stock_detail: settings.showLowStockWarnings,
          })
          .eq('branch_id', storeId);
      } else {
        // Insert new settings
        result = await supabase
          .from('stock_check_settings')
          .insert({
            branch_id: storeId,
            auto_reorder: settings.autoReorder,
            show_stock_detail: settings.showLowStockWarnings,
          });
      }

      if (result.error) {
        throw result.error;
      }

      toast({
        title: 'Success',
        description: 'Inventory settings saved successfully',
      });
      
      onOpenChange(false);
    } catch (error) {
      console.error('Error saving inventory settings:', error);
      toast({
        title: 'Error',
        description: 'Failed to save inventory settings',
        variant: 'destructive',
      });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Inventory Settings</DialogTitle>
          <DialogDescription>
            Configure settings for this store's inventory management.
          </DialogDescription>
        </DialogHeader>

        <div className="py-4 space-y-6">
          {isLoading ? (
            <div className="flex items-center justify-center h-[200px]">
              <p>Loading settings...</p>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="auto-reorder">Auto Reorder</Label>
                  <p className="text-sm text-muted-foreground">
                    Automatically create purchase orders when stock is low
                  </p>
                </div>
                <Switch
                  id="auto-reorder"
                  checked={settings.autoReorder}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, autoReorder: checked }))
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label htmlFor="stock-warnings">Low Stock Warnings</Label>
                  <p className="text-sm text-muted-foreground">
                    Show warnings for ingredients below reorder point
                  </p>
                </div>
                <Switch
                  id="stock-warnings"
                  checked={settings.showLowStockWarnings}
                  onCheckedChange={(checked) => 
                    setSettings(prev => ({ ...prev, showLowStockWarnings: checked }))
                  }
                />
              </div>
            </>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSaveSettings} disabled={isLoading || isSaving}>
            {isSaving ? 'Saving...' : 'Save changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InventorySettingsDialog;
