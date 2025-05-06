
export interface RequestItemDB {
  id: string;
  ingredient_id: string;
  quantity: number;
  note?: string;
  recommended_qty?: number;
  current_qty?: number;
  fulfilled?: boolean;
  ingredients: {
    name: string;
  };
}

export interface RequestDB {
  id: string;
  branch_id: string;
  user_id: string;
  requested_at: string;
  status: 'pending' | 'fulfilled';
  branches: {
    name: string;
  };
  store_staff: {
    staff_name: string;
  };
  request_items: RequestItemDB[];
}

export interface RequestItem {
  id: string;
  branchId: string;
  branchName: string;
  userId: string;
  userName: string;
  requestedAt: string;
  status: 'pending' | 'fulfilled';
  itemsCount: number;
  detailText: string;
  requestItems: {
    id: string;
    ingredientId: string;
    ingredientName: string;
    quantity: number;
    note?: string;
    recommendedQty?: number;
    currentQty?: number;
    fulfilled?: boolean;
  }[];
}

export interface DetailedRequestItem {
  id: string;
  ingredientId: string;
  ingredientName: string;
  quantity: number;
  note?: string;
  recommendedQty?: number;
  currentQty?: number;
  fulfilled?: boolean;
  reorderPoint?: number;
}
