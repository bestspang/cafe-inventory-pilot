
import React, { createContext, useContext, useEffect, useState } from 'react';
import { isDemoMode } from '@/utils/demoMode';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/sonner';

interface DemoModeContextType {
  isDemoMode: boolean;
  isSeeding: boolean;
  seedingError: string | null;
}

const DemoModeContext = createContext<DemoModeContextType | undefined>(undefined);

export const DemoModeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isDemoModeActive, setIsDemoModeActive] = useState(false);
  const [isSeeding, setIsSeeding] = useState(false);
  const [seedingError, setSeedingError] = useState<string | null>(null);
  const [seedingCompleted, setSeedingCompleted] = useState(false);

  useEffect(() => {
    const demoModeActive = isDemoMode();
    setIsDemoModeActive(demoModeActive);

    // If demo mode is active, seed the database
    if (demoModeActive && !seedingCompleted) {
      seedDemoData();
    }
  }, [seedingCompleted]);

  const seedDemoData = async () => {
    try {
      setIsSeeding(true);
      setSeedingError(null);

      // Call the seed-demo-data edge function
      const { data, error } = await supabase.functions.invoke('seed-demo-data');

      if (error) {
        throw new Error(error.message);
      }

      // Set seeding completed
      setSeedingCompleted(true);
      
      console.log('Demo data seeded successfully:', data);
      toast.success('Demo mode activated', {
        description: 'Demo data has been loaded successfully.'
      });
    } catch (error: any) {
      console.error('Error seeding demo data:', error);
      setSeedingError(error.message);
      toast.error('Failed to load demo data', {
        description: error.message
      });
    } finally {
      setIsSeeding(false);
    }
  };

  const value = {
    isDemoMode: isDemoModeActive,
    isSeeding,
    seedingError
  };

  return <DemoModeContext.Provider value={value}>{children}</DemoModeContext.Provider>;
};

export const useDemoMode = () => {
  const context = useContext(DemoModeContext);
  if (context === undefined) {
    throw new Error('useDemoMode must be used within a DemoModeProvider');
  }
  return context;
};
