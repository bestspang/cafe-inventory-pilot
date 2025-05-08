
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, ClipboardList, ShoppingBag, Store, FileText, BarChart4, Users, Bell, Settings, Package } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { Sidebar, SidebarContent, SidebarFooter, SidebarGroup, SidebarGroupContent, SidebarGroupLabel, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem, SidebarTrigger } from '@/components/ui/sidebar';
import { cn } from '@/lib/utils';
import { useLocale } from '@/context/LocaleContext';
import { FormattedMessage, useIntl } from 'react-intl';

const LanguageIndicator = () => {
  const { locale } = useLocale();
  
  return (
    <span className="ml-auto text-xs bg-primary/10 text-primary-foreground px-2 py-0.5 rounded-full">
      {locale.toUpperCase()}
    </span>
  );
};

type NavItem = {
  titleId: string;
  defaultTitle: string;
  icon: React.ElementType;
  path: string;
  role?: Array<'owner' | 'manager' | 'staff'>;
  isDisabled?: boolean;
  isComing?: boolean;
  showLanguageIndicator?: boolean;
};

const navItems: NavItem[] = [
  {
    titleId: "sidebar.dashboard",
    defaultTitle: "Dashboard",
    icon: Home,
    path: "/dashboard"
  }, 
  {
    titleId: "sidebar.requests",
    defaultTitle: "Requests",
    icon: ClipboardList,
    path: "/requests"
  }, 
  {
    titleId: "sidebar.stock.check",
    defaultTitle: "Stock Check",
    icon: ShoppingBag,
    path: "/stock-check"
  }, 
  {
    titleId: "sidebar.inventory",
    defaultTitle: "Inventory",
    icon: Package,
    path: "/inventory",
    role: ['owner', 'manager']
  }, 
  {
    titleId: "sidebar.branches",
    defaultTitle: "Branches",
    icon: Store,
    path: "/branches",
    role: ['owner', 'manager']
  }, 
  {
    titleId: "sidebar.suppliers",
    defaultTitle: "Suppliers",
    icon: Store,
    path: "/suppliers",
    role: ['owner', 'manager'],
    isComing: true
  }, 
  {
    titleId: "sidebar.purchase.orders",
    defaultTitle: "Purchase Orders",
    icon: FileText,
    path: "/purchase-orders",
    role: ['owner', 'manager'],
    isComing: true
  }, 
  {
    titleId: "sidebar.reports",
    defaultTitle: "Reports",
    icon: BarChart4,
    path: "/reports",
    role: ['owner', 'manager'],
    isComing: true
  }, 
  {
    titleId: "sidebar.users",
    defaultTitle: "Users",
    icon: Users,
    path: "/users",
    role: ['owner'],
    isComing: true
  }, 
  {
    titleId: "settings.title",
    defaultTitle: "Settings",
    icon: Settings,
    path: "/settings",
    showLanguageIndicator: true
  }
];

const AppSidebar = () => {
  const location = useLocation();
  const { user } = useAuth();
  const intl = useIntl();
  
  const filteredNavItems = navItems.filter(item => {
    if (!item.role) return true;
    return item.role.includes(user?.role as any);
  });
  
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-primary flex items-center justify-center text-primary-foreground font-bold">GI</div>
          <div>
            <h2 className="font-semibold">Good Inventory</h2>
            <p className="text-xs text-sidebar-foreground/70">v0.0.1</p>
          </div>
        </div>
        <SidebarTrigger className="ml-2" />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredNavItems.map(item => (
                <SidebarMenuItem key={item.path}>
                  <SidebarMenuButton asChild disabled={item.isDisabled}>
                    <Link 
                      to={item.isComing ? '#' : item.path} 
                      className={cn(
                        "relative group flex items-center justify-between w-full", 
                        location.pathname === item.path && "text-sidebar-primary font-medium",
                        item.isComing && "opacity-50 cursor-not-allowed"
                      )}
                    >
                      <span className="flex items-center">
                        <item.icon className="mr-2 h-5 w-5" />
                        <span>
                          <FormattedMessage id={item.titleId} defaultMessage={item.defaultTitle} />
                        </span>
                      </span>
                      
                      {item.isComing && (
                        <span className="absolute -top-1 right-0 bg-primary text-primary-foreground text-[8px] px-1 py-0.5 rounded-full">
                          <FormattedMessage id="sidebar.soon" defaultMessage="SOON" />
                        </span>
                      )}
                      
                      {item.showLanguageIndicator && <LanguageIndicator />}
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
