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
  addStore: (store: Branch) => void; // Function to add a store directly to state
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
    setStores(prevStores => [...prevStores, store]);
  };

  const fetchStores = async () => {
    if (!isAuthenticated || !user?.id) return;
    
    try {
      setIsLoading(true);
      
      // Try fetching from stores table first (with owner_id)
      const { data: storesData, error: storesError } = await supabase
        .from('stores')
        .select('id, name, address, timezone, is_open, created_at, updated_at, owner_id')
        .eq('owner_id', user.id)
        .order('name');
      
      if (!storesError && storesData && storesData.length > 0) {
        console.log('Fetched stores:', storesData);
        setStores(storesData as Branch[]);
      } else {
        // Fallback to branches table
        const { data: branchesData, error: branchesError } = await supabase
          .from('branches')
          .select('id, name, address, timezone, is_open, created_at, updated_at')
          .order('name');
        
        if (branchesError) {
          console.error('Error fetching branches:', branchesError);
          throw branchesError;
        }
        
        // Add owner_id to match Branch type
        const branchesWithOwnerId = (branchesData || []).map(branch => ({
          ...branch,
          owner_id: user.id // Set current user as owner for all branches
        }));
        
        console.log('Fetched branches with added owner_id:', branchesWithOwnerId);
        setStores(branchesWithOwnerId as Branch[]);
      }
      
      // If we have stores but no current selection, try to restore from localStorage or use first
      if (stores.length > 0 && !currentStoreId) {
        const savedStoreId = localStorage.getItem('selectedStoreId');
        
        // Check if the saved ID is in the available stores
        const validSavedId = savedStoreId && stores.some(store => store.id === savedStoreId);
        
        setCurrentStoreId(validSavedId ? savedStoreId : stores[0].id);
      }
    } catch (error) {
      console.error('Error fetching branches/stores:', error);
      toast.error('Failed to load your branches');
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch stores when the component mounts or auth changes
  useEffect(() => {
    fetchStores();
  }, [isAuthenticated, user?.id]);

  // Set up realtime subscription for branches changes
  useEffect(() => {
    if (!isAuthenticated || !user?.id) return;
    
    console.log('Setting up realtime subscription for branches');
    
    const channel = supabase
      .channel('branches_changes')
      .on('postgres_changes', 
          { event: '*', schema: 'public', table: 'branches' },
          (payload) => {
            console.group('Branch change detected via StoresContext');
            console.log('Change type:', payload.eventType);
            console.log('Changed data:', payload.new);
            
            // Refresh all branches on any change
            fetchStores();
            
            console.groupEnd();
          }
      )
      .subscribe();
      
    return () => {
      console.log('Cleaning up branches subscription in StoresContext');
      supabase.removeChannel(channel);
    };
  }, [isAuthenticated, user?.id]);

  // Function to create a new branch
  const createStore = async (name: string, address?: string, timezone: string = 'UTC') => {
    if (!user?.id) {
      toast.error('You must be logged in to create a branch');
      return null;
    }
    
    try {
      console.log('Creating new branch with owner_id:', user.id);
      
      // Try creating in stores table first
      const { data: storeData, error: storeError } = await supabase
        .from('stores')
        .insert({
          name,
          address: address || null,
          timezone,
          owner_id: user.id
        })
        .select()
        .single();
        
      if (!storeError && storeData) {
        toast.success('Branch created successfully');
        console.log('New store created:', storeData);
        addStore(storeData as Branch);
        setCurrentStoreId(storeData.id);
        return storeData as Branch;
      }
      
      console.log('Failed to create in stores table, trying branches table');
      
      // Fallback to branches table
      const { data: branchData, error: branchError } = await supabase
        .from('branches')
        .insert({
          name,
          address: address || null,
          timezone
          // Note: branches table might not have owner_id column
        })
        .select()
        .single();
        
      if (branchError) {
        console.error('Error creating branch:', branchError);
        toast.error('Failed to create branch');
        return null;
      }
      
      // Add owner_id to match Branch type
      const branchWithOwnerId = {
        ...branchData,
        owner_id: user.id
      };
      
      toast.success('Branch created successfully');
      console.log('New branch created:', branchWithOwnerId);
      addStore(branchWithOwnerId as Branch);
      setCurrentStoreId(branchWithOwnerId.id);
      return branchWithOwnerId as Branch;
    } catch (error) {
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
