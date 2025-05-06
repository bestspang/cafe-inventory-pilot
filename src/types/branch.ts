
import { Branch as BaseBranch } from '@/types/supabase-types';

export interface Branch extends BaseBranch {
  name: string;
  address: string | null; // Made explicitly nullable to match DB schema
  timezone: string | null;
  is_open: boolean;
  created_at: string | null;
  updated_at: string;
}

export interface BranchActivity {
  id: string;
  branch_id: string;
  action: string;
  performed_by: string;
  performed_at: string;
  user?: {
    name: string;
    email: string;
  };
}

export interface StaffMember {
  id: string;
  branch_id: string;
  staff_name: string;
  created_at: string;
}
