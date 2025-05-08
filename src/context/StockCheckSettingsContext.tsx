
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

type StockCheckSettings = {
  showStockDetail: boolean;
  autoReorder: boolean;
  saving: boolean;
  update: (settings: Partial<Omit<StockCheckSettings, 'saving' | 'update'>>) => Promise<void>;
};

const defaultSettings: StockCheckSettings = {
  showStockDetail: false,
  autoReorder: false,
  saving: false,
  update: async () => {}
};

const StockCheckSettingsContext = createContext<StockCheckSettings>(defaultSettings);

export function StockCheckSettingsProvider({
  branchId,
  children
}: {
  branchId: string;
  children: React.ReactNode;
}) {
  const [showStockDetail, setShowStockDetail] = useState(false);
  const [autoReorder, setAutoReorder] = useState(false);
  const [saving, setSaving] = useState(false);

  // Load settings on mount or branch change
  useEffect(() => {
    async function loadSettings() {
      if (!branchId) return;
      
      try {
        const { data, error } = await supabase
          .from('stock_check_settings')
          .select('show_stock_detail, auto_reorder')
          .eq('branch_id', branchId)
          .maybeSingle();
        
        if (error) throw error;
        
        if (data) {
          setShowStockDetail(data.show_stock_detail);
          setAutoReorder(data.auto_reorder);
        }
      } catch (error) {
        console.error('Error loading stock check settings:', error);
      }
    }
    
    loadSettings();
  }, [branchId]);

  const update = async (settings: Partial<Omit<StockCheckSettings, 'saving' | 'update'>>) => {
    if (!branchId) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('stock_check_settings')
        .upsert({
          branch_id: branchId,
          show_stock_detail: settings.showStockDetail ?? showStockDetail,
          auto_reorder: settings.autoReorder ?? autoReorder,
          updated_at: new Date().toISOString()
        }, { 
          onConflict: 'branch_id' 
        });
      
      if (error) throw error;
      
      if (settings.showStockDetail !== undefined) {
        setShowStockDetail(settings.showStockDetail);
      }
      
      if (settings.autoReorder !== undefined) {
        setAutoReorder(settings.autoReorder);
      }
      
    } catch (error) {
      console.error('Error updating stock check settings:', error);
      throw error;
    } finally {
      setSaving(false);
    }
  };

  return (
    <StockCheckSettingsContext.Provider value={{ 
      showStockDetail, 
      autoReorder, 
      saving, 
      update 
    }}>
      {children}
    </StockCheckSettingsContext.Provider>
  );
}

export const useStockCheckSettings = () => useContext(StockCheckSettingsContext);
