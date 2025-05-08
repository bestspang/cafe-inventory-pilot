
export interface QuickRequestIngredient {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  onHandQty?: number;
  reorderPt?: number;
}

export interface StaffMember {
  id: string;
  branchId: string;
  staffName: string;
  createdAt: string;
}

export interface QuickRequestFormState {
  branchId: string;
  staffId: string;
  action: 'request' | 'stock-update';
  comment?: string;
}
