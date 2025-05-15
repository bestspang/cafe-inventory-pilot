
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/context/AuthContext';
import { toast } from '@/components/ui/sonner';
import { Branch } from '@/types';

interface StoresContextType {
  stores: Branch[];
  currentStoreId: string | null;
  setCurrentStoreId: (id: string) => void;
  isLoading: boolean;
  createStore: (name: string, address?: string, timezone?: string) => Promise<Branch | null>;
  currentStore: Branch | null;
  refreshStores: () => Promise<void>;
  addStore: (store: Branch) => void;
}

const StoresContext = createContext<StoresContextType | undefined>(undefined);

export function StoresProvider({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated } = useAuth();
  const [stores, setStores] = useState<Branch[]>([]);
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

  // Function to directly add a store to the local state
  const addStore = (store: Branch) => {
    setStores(prevStores => {
      // Check if store already exists to avoid duplicates
      const exists = prevStores.some(s => s.id === store.id);
      if (exists) return prevStores;
      return [...prevStores, store];
    });
  };

  const fetchStores = async () => {
    if (!isAuthenticated || !user?.id) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      console.log('Fetching stores for user:', user.id);
      
      // No need to explicitly filter by owner_id - RLS does this now
      const { data, error } = await supabase
        .from('stores')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('Error fetching stores:', error);
        throw error;
      }
      
      console.log('Fetched stores in context:', data || []);
      setStores(data || [] as Branch[]);
      
      // If we have stores but no current selection, try to restore from localStorage or use first
      if (data && data.length > 0 && !currentStoreId) {
        const savedStoreId = localStorage.getItem('selectedStoreId');
        
        // Check if the saved ID is in the available stores
        const validSavedId = savedStoreId && data.some(store => store.id === savedStoreId);
        
        setCurrentStoreId(validSavedId ? savedStoreId : data[0].id);
      } else if (!data || data.length === 0) {
        // Clear current store if no stores are available
        setCurrentStoreId(null);
      }
    } catch (error) {
      console.error('Error fetching stores:', error);
      toast.error('Failed to load your branches');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stores when the component mounts or auth changes
  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchStores();
    } else {
      setStores([]);
      setCurrentStoreId(null);
    }
  }, [isAuthenticated, user?.id]);

  // Set up realtime subscription for stores changes
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    console.log('Setting up realtime subscription for stores in context');
    
    const channel = supabase
      .channel('stores_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'stores' },
          (payload) => {
            console.log('Store change detected via StoresContext:', payload);
            fetchStores();
          }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up stores subscription in StoresContext');
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id]);

  // Function to create a new store
  const createStore = async (name: string, address?: string, timezone: string = 'Asia/Bangkok') => {
    if (!user?.id) {
      toast.error('You must be logged in to create a branch');
      return null;
    }
    
    try {
      console.log('Creating new store with owner_id:', user.id);
      
      const newStoreData = {
        name,
        address: address || null,
        timezone,
        owner_id: user.id // Critical for RLS
      };

      console.log('Full store data being sent:', newStoreData);
      
      const { data: createdStore, error: storeError } = await supabase
        .from('stores')
        .insert(newStoreData)
        .select()
        .single();
        
      if (storeError) {
        console.error('Error creating store:', storeError);
        toast.error(`Failed to create branch: ${storeError.message}`);
        return null;
      }
      
      toast.success('Branch created successfully');
      console.log('New store created:', createdStore);
      
      // Add the new store to local state
      addStore(createdStore as Branch);
      
      // Set it as the current store
      setCurrentStoreId(createdStore.id);
      
      return createdStore as Branch;
    } catch (error: any) {
      console.error('Error creating branch:', error);
      toast.error('Failed to create branch');
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
        refreshStores: fetchStores,
        addStore
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
