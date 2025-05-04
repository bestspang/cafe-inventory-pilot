
import React from 'react';
import { Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface StockCheckSearchBarProps {
  search: string;
  setSearch: (value: string) => void;
}

const StockCheckSearchBar: React.FC<StockCheckSearchBarProps> = ({ search, setSearch }) => {
  return (
    <div className="relative w-full md:w-auto">
      <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
      <Input 
        placeholder="Search ingredients..." 
        className="pl-8 w-full md:w-[250px]"
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
    </div>
  );
};

export default StockCheckSearchBar;
