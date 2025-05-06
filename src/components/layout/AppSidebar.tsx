import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, 
  ClipboardList, 
  ShoppingBag, 
  Store, 
  FileText, 
  BarChart4, 
  Users, 
  Bell, 
  Settings,
  Package
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { 
  Sidebar, 
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger 
} from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';

type NavItem = {
  title: string;
  icon: React.ElementType;
  path: string;
  role?: Array<'owner' | 'manager' | 'staff'>;
  isDisabled?: boolean;
  isComing?: boolean;
};

const navItems: NavItem[] = [
  { 
    title: "Dashboard", 
    icon: Home, 
    path: "/dashboard"
  },
  { 
    title: "Requests", 
    icon: ClipboardList, 
    path: "/requests",
  },
  { 
    title: "Stock Check", 
    icon: ShoppingBag, 
    path: "/stock-check",
  },
  { 
    title: "Inventory", 
    icon: Package, 
    path: "/inventory",
    role: ['owner', 'manager']
  },
  { 
    title: "Branches", 
    icon: Store, 
    path: "/branches",
    role: ['owner', 'manager']
  },
  { 
    title: "Suppliers", 
    icon: Store, 
    path: "/suppliers",
    role: ['owner', 'manager'],
    isComing: true
  },
  { 
    title: "Purchase Orders", 
    icon: FileText, 
    path: "/purchase-orders",
    role: ['owner', 'manager'],
    isComing: true
  },
  { 
    title: "Reports", 
    icon: BarChart4, 
    path: "/reports",
    role: ['owner', 'manager'],
    isComing: true
  },
  { 
    title: "Users", 
    icon: Users, 
    path: "/users",
    role: ['owner'],
    isComing: true
  },
  { 
    title: "Settings", 
    icon: Settings, 
    path: "/settings",
    isComing: true
  }
];

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();

  const filteredNavItems = navItems.filter(item => {
    if (!item.role) return true;
    return item.role.includes(user?.role as any);
  });

  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">
            CI
          </div>
          <div>
            <h2 className="font-semibold">Café Inventory</h2>
            <p className="text-xs text-sidebar-foreground/70">v1.0.0</p>
          </div>
        </div>
        <SidebarTrigger className="ml-2" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map((item) => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild disabled={item.isDisabled}>
                    <Link 
                      to={item.isComing ? '#' : item.path}
                      className={cn(
                        "relative group",
                        location.pathname === item.path && "text-sidebar-primary font-medium",
                        item.isComing && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <item.icon className="mr-2 h-5 w-5" />
                      <span>{item.title}</span>
                      {item.isComing && (
                        <span className="absolute -top-1 -right-1 bg-primary text-primary-foreground text-[8px] px-1 py-0.5 rounded-full">
                          SOON
                        </span>
                      )}
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <div className="px-4 py-3 border-t border-sidebar-border">
          <div className="flex items-center">
            <div className="w-8 h-8 rounded-full bg-cafe-200 text-cafe-800 flex items-center justify-center font-medium">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="ml-3">
              <p className="text-sm font-medium">{user?.name}</p>
              <p className="text-xs text-sidebar-foreground/70 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
