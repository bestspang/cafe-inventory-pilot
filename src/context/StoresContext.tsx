
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
      
      // Get branches where the user is the owner
      const { data, error } = await supabase
        .from('branches')
        .select('id, name, address, timezone, is_open, created_at, updated_at, owner_id')
        .eq('owner_id', user.id)
        .order('name');
      
      if (error) throw error;
      
      // Type the data explicitly as an array to avoid deep type nesting issues
      const typedData: Branch[] = data || [];
      setStores(typedData);
      
      // If we have stores but no current selection, try to restore from localStorage or use first
      if (typedData.length > 0 && !currentStoreId) {
        const savedStoreId = localStorage.getItem('selectedStoreId');
        
        // Check if the saved ID is in the available stores
        const validSavedId = savedStoreId && typedData.some(store => store.id === savedStoreId);
        
        setCurrentStoreId(validSavedId ? savedStoreId : typedData[0].id);
      }
    } catch (error) {
      console.error('Error fetching branches:', error);
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
          { event: '*', schema: 'public', table: 'branches', filter: `owner_id=eq.${user.id}` },
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
      const { data, error } = await supabase
        .from('branches')
        .insert({
          name,
          address: address || null,
          timezone,
          owner_id: user.id // Make sure owner_id is set to the current user
        })
        .select()
        .single();
        
      if (error) throw error;
      
      toast.success('Branch created successfully');
      
      // Use a simple type assertion
      const newBranch = data as Branch;
      
      // Optimistically update the local state
      addStore(newBranch);
      
      // Set the new store as current
      setCurrentStoreId(newBranch.id);
      
      return newBranch;
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
