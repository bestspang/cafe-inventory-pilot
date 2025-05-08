
import React from 'react';
import { useLocation } from 'react-router-dom';
import { Menu } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useSidebar } from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

const Header = () => {
  const location = useLocation();
  const {
    user,
    logout
  } = useAuth();
  const {
    toggleSidebar
  } = useSidebar();

  return <div className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-6 border-b bg-background px-4 shadow-sm">
      <Button variant="ghost" size="icon" className="md:hidden" onClick={toggleSidebar}>
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open sidebar</span>
      </Button>
      <div className="flex-1">
        {location.pathname === "/dashboard" && <span className="text-foreground font-medium">Dashboard</span>}
        {location.pathname === "/requests" && <span className="text-foreground font-medium">Requests</span>}
        {location.pathname === "/stock-check" && <span className="text-foreground font-medium">Stock Check</span>}
        {location.pathname === "/inventory" && <span className="text-foreground font-medium">Ingredients</span>}
        {location.pathname === "/branches" && <span className="text-foreground font-medium">Branches</span>}
        {location.pathname === "/suppliers" && <span className="text-foreground font-medium">Suppliers</span>}
        {location.pathname === "/purchase-orders" && <span className="text-foreground font-medium">Purchase Orders</span>}
        {location.pathname === "/reports" && <span className="text-foreground font-medium">Reports</span>}
        {location.pathname === "/users" && <span className="text-foreground font-medium">Users</span>}
        {location.pathname === "/settings" && <span className="text-foreground font-medium">Settings</span>}
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarImage src="" alt={user?.name || 'Avatar'} />
              <AvatarFallback>{user?.name?.charAt(0) || 'U'}</AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" alignOffset={8} forceMount className="w-56">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">{user?.name}</p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => logout()} className="cursor-pointer">
            Log out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>;
};
export default Header;
