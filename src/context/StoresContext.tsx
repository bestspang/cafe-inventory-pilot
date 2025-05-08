
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';

interface Store {
  id: string;
  name: string;
  address?: string | null;
  timezone?: string | null;
  is_open: boolean;
}

interface StoresContextType {
  stores: Store[];
  currentStoreId: string | null;
  setCurrentStoreId: (id: string) => void;
  isLoading: boolean;
  createStore: (name: string, address?: string, timezone?: string) => Promise<Store | null>;
  currentStore: Store | null;
  refreshStores: () => Promise<void>;
}

const StoresContext = createContext<StoresContextType | undefined>(undefined);

export function StoresProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Store[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [currentStoreId, setCurrentStoreId] = useState<string | null>(null);

  // Find the current store from the list
  const currentStore = stores.find(store => store.id === currentStoreId) || null;

  // Store ID in localStorage to persist selection
  useEffect(() => {
    if (currentStoreId) {
      localStorage.setItem('selectedStoreId', currentStoreId);
    }
  }, [currentStoreId]);

  const fetchStores = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from('stores')
        .select('id, name, address, timezone, is_open')
        .order('name');
        
      if (error) throw error;
      
      setStores(data || []);
      
      // If we have stores but no current selection, try to restore from localStorage or use first
      if (data && data.length > 0 && !currentStoreId) {
        const savedStoreId = localStorage.getItem('selectedStoreId');
        
        // Check if the saved ID is in the available stores
        const validSavedId = savedStoreId && data.some(store => store.id === savedStoreId);
        
        setCurrentStoreId(validSavedId ? savedStoreId : data[0].id);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load your stores');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stores when the component mounts or auth changes
  useEffect(() => {
    fetchStores();
  }, [isAuthenticated, user?.id]);

  // Function to create a new store
  const createStore = async (name: string, address?: string, timezone: string = 'UTC') => {
    if (!user?.id) {
      toast.error('You must be logged in to create a store');
      return null;
    }
    
    try {
      const { data, error } = await supabase
        .from('stores')
        .insert({
          name,
          address: address || null,
          timezone,
          owner_id: user.id
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Store created successfully');
      
      // Refresh the stores list
      await fetchStores();
      
      // Set the new store as current
      setCurrentStoreId(data.id);
      
      return data;
    } catch (error) {
      console.error('Error creating store:', error);
      toast.error('Failed to create store');
      return null;
    }
  };

  return (
    <StoresContext.Provider
      value={{
        stores,
        currentStoreId,
        setCurrentStoreId,
        isLoading,
        createStore,
        currentStore,
        refreshStores: fetchStores
      }}
    >
      {children}
    </StoresContext.Provider>
  );
}

export const useStores = () => {
  const context = useContext(StoresContext);
  if (context === undefined) {
    throw new Error('useStores must be used within a StoresProvider');
  }
  return context;
};
