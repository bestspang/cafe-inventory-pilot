
import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Bell, Search, Menu } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { useAuth } from '@/context/AuthContext';
import StoreSwitcher from '@/components/stores/StoreSwitcher';

const Header = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  // Hide store switcher on Dashboard and Requests pages
  const hideStoreSwitcher = ['/dashboard', '/requests'].includes(location.pathname);

  // Generate breadcrumbs from current path
  const generateBreadcrumbs = () => {
    const pathSegments = location.pathname.split('/').filter(segment => segment);
    
    const breadcrumbs = [
      { name: 'Home', path: '/dashboard' },
      ...pathSegments.map((segment, index) => {
        const path = `/${pathSegments.slice(0, index + 1).join('/')}`;
        return {
          name: segment.charAt(0).toUpperCase() + segment.slice(1).replace('-', ' '),
          path
        };
      })
    ];

    return breadcrumbs.filter((breadcrumb, index) => {
      // Remove Home if current page is dashboard
      if (index === 0 && pathSegments[0] === 'dashboard') return false;
      return true;
    });
  };

  const breadcrumbs = generateBreadcrumbs();

  return (
    <header className="bg-background border-b flex items-center justify-between p-4 md:px-6 h-16 sticky top-0 z-10">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="md:hidden">
          <Menu className="h-5 w-5" />
        </SidebarTrigger>
        
        <div className="hidden md:flex items-center gap-1">
          {breadcrumbs.map((breadcrumb, index) => (
            <React.Fragment key={breadcrumb.path}>
              {index > 0 && <span className="mx-1 text-muted-foreground">/</span>}
              {index === breadcrumbs.length - 1 ? (
                <span className="text-foreground font-medium">{breadcrumb.name}</span>
              ) : (
                <Link to={breadcrumb.path} className="text-muted-foreground hover:text-foreground transition-colors">
                  {breadcrumb.name}
                </Link>
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
      
      <div className="flex items-center gap-2">
        {!hideStoreSwitcher && <StoreSwitcher />}
        
        <div className="hidden md:flex relative w-64">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search..." 
            className="pl-8"
          />
        </div>
        
        <Button size="icon" variant="ghost" className="relative">
          <Bell className="h-5 w-5" />
          <span className="absolute top-1 right-1 w-2 h-2 bg-destructive rounded-full"></span>
        </Button>
        
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-cafe-200 text-cafe-800 flex items-center justify-center font-medium">
                {user?.name?.charAt(0) || 'U'}
              </div>
              <span className="hidden sm:inline-block">{user?.name}</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5 text-sm font-medium">{user?.email}</div>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={() => navigate('/profile')}>
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={() => navigate('/settings')}>
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onSelect={logout}>
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
};

export default Header;
