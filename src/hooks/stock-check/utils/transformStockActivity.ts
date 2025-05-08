
import { StockActivity } from '../types';

export const createStaffNameLookup = (
  staffData: Array<{ id: string; staff_name: string }> | null,
  profilesData: Array<{ id: string; email: string; name: string }> | null
) => {
  const staffMap = new Map<string, string>();
  const profileMap = new Map<string, string>();
  
  if (staffData) {
    staffData.forEach(staff => {
      staffMap.set(staff.id, staff.staff_name);
    });
  }
  
  if (profilesData) {
    profilesData.forEach(profile => {
      let displayName = profile.name;
      if (profile.email && !displayName) {
        const emailLocal = profile.email.split('@')[0];
        displayName = emailLocal;
      }
      profileMap.set(profile.id, displayName || 'Unknown User');
    });
  }
  
  return { staffMap, profileMap };
};

export const getStaffName = (
  username: string | null,
  userId: string | null,
  staffMap: Map<string, string>,
  profileMap: Map<string, string>
) => {
  // First check for username from the stock check itself
  if (username) return username;
  
  // If no username in stock check, check staff map
  if (userId && staffMap.has(userId)) {
    return staffMap.get(userId) as string;
  }
  
  // If not found in staff map, check profiles
  if (userId && profileMap.has(userId)) {
    return profileMap.get(userId) as string;
  }
  
  // Fallback name
  return 'Unknown Staff';
};

export const transformStockCheckData = (
  stockCheckData: any[],
  staffMap: Map<string, string>,
  profileMap: Map<string, string>
) => {
  const activities: StockActivity[] = [];
  
  stockCheckData.forEach(stockCheck => {
    const staffName = getStaffName(
      stockCheck.username, 
      stockCheck.user_id, 
      staffMap, 
      profileMap
    );
    
    if (stockCheck.stock_check_items && stockCheck.stock_check_items.length > 0) {
      stockCheck.stock_check_items.forEach((item: any) => {
        if (item.ingredients) {
          activities.push({
            id: `sci-${item.id}`,
            checkedAt: stockCheck.checked_at,
            branchName: stockCheck.branches?.name || 'Unknown',
            staffName,
            ingredient: item.ingredients.name,
            quantity: item.on_hand_qty,
            unit: item.ingredients.unit,
            comment: null,
            source: 'stock-check',
            requestedBy: null
          });
        }
      });
    }
  });
  
  return activities;
};

export const transformRequestData = (requestData: any[]) => {
  const activities: StockActivity[] = [];
  
  requestData.forEach(request => {
    // Get the name of who made the request using store_staff
    let requesterName = 'Unknown';
    if (request.store_staff) {
      requesterName = request.store_staff.staff_name || 'Unknown';
    }
    
    if (request.request_items && request.request_items.length > 0) {
      request.request_items.forEach((item: any) => {
        if (item.ingredients) {
          activities.push({
            id: `req-${item.id}`,
            checkedAt: request.requested_at,
            branchName: request.branches?.name || 'Unknown',
            staffName: 'System',
            ingredient: item.ingredients.name,
            quantity: item.quantity,
            unit: item.ingredients.unit,
            comment: 'Fulfilled from request',
            source: 'fulfilled-request',
            requestedBy: requesterName
          });
        }
      });
    }
  });
  
  return activities;
};
