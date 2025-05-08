
// Define the StockActivity type for activity data
export interface StockActivity {
  id: string;
  checkedAt: string;
  branchName: string;
  staffName: string;
  ingredient: string;
  quantity: number;
  quantityChange?: number; // Added field for quantity change (+/-)
  unit: string;
  comment: string | null;
  source: 'stock-check' | 'fulfilled-request' | null;
  requestedBy: string | null;
}
