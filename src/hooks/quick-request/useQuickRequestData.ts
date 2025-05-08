
import { useState, useEffect } from 'react';
import { Branch } from '@/types';
import { StaffMember, QuickRequestIngredient } from '@/types/quick-request';
import { fetchBranches } from './services/fetchBranches';
import { fetchIngredients } from './services/fetchIngredients';
import { fetchStaffMembers } from './services/fetchStaffMembers';

export const useQuickRequestData = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [branches, setBranches] = useState<Branch[]>([]);
  const [staffMembers, setStaffMembers] = useState<StaffMember[]>([]);
  const [ingredients, setIngredients] = useState<QuickRequestIngredient[]>([]);
  const [selectedBranchId, setSelectedBranchId] = useState<string>('');

  // Load initial branches data on component mount
  useEffect(() => {
    console.log('Initial loading of branch data');
    const loadBranches = async () => {
      setIsLoading(true);
      const data = await fetchBranches();
      setBranches(data);
      setIsLoading(false);
    };
    
    loadBranches();
  }, []);

  // Load ingredients for a specific branch
  const loadIngredientsForBranch = async (branchId?: string) => {
    setIsLoading(true);
    const targetBranchId = branchId || selectedBranchId;
    const data = await fetchIngredients(targetBranchId);
    setIngredients(data);
    if (branchId) setSelectedBranchId(branchId);
    setIsLoading(false);
    return data;
  };

  // Load staff members for a specific branch  
  const loadStaffForBranch = async (branchId: string) => {
    setIsLoading(true);
    const data = await fetchStaffMembers(branchId);
    setStaffMembers(data);
    setIsLoading(false);
    return data;
  };

  return {
    isLoading,
    setIsLoading,
    branches,
    staffMembers,
    ingredients,
    fetchBranches: async () => {
      setIsLoading(true);
      const data = await fetchBranches();
      setBranches(data);
      setIsLoading(false);
      return data;
    },
    fetchIngredients: loadIngredientsForBranch,
    fetchStaffMembers: loadStaffForBranch,
    selectedBranchId
  };
};
