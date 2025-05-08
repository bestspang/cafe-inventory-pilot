
// Define the StockActivity type for activity data
export interface StockActivity {
  id: string;
  checkedAt: string;
  branchName: string;
  staffName: string;
  ingredient: string;
  quantity: number;
  unit: string;
  comment: string | null;
  source: 'stock-check' | 'fulfilled-request' | null;
  requestedBy: string | null;
}
