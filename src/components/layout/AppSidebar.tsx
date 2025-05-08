
import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarHeader,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarGroup
} from '@/components/ui/sidebar';
import { 
  LayoutDashboard, 
  Package, 
  ClipboardCheck, 
  Send, 
  Store, 
  Users,
  Settings
} from 'lucide-react';
import { useLocale } from '@/context/LocaleContext';

const AppSidebar = () => {
  const { t } = useLocale();

  return (
    <Sidebar>
      <SidebarHeader className="flex items-center justify-between">
        <div className="flex items-center gap-2 px-2">
          <div className="text-xl font-semibold tracking-tight">{t('app.name')}</div>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('common.dashboard')}>
                <Link to="/dashboard">
                  <LayoutDashboard />
                  <span>{t('common.dashboard')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('common.inventory')}>
                <Link to="/inventory">
                  <Package />
                  <span>{t('common.inventory')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('common.stockCheck')}>
                <Link to="/stock-check">
                  <ClipboardCheck />
                  <span>{t('common.stockCheck')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('common.requests')}>
                <Link to="/requests">
                  <Send />
                  <span>{t('common.requests')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('common.branches')}>
                <Link to="/branches">
                  <Store />
                  <span>{t('common.branches')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Manage Staff">
                <Link to="/manage-staff">
                  <Users />
                  <span>Manage Staff</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter className="pb-4">
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip={t('common.settings')}>
                <Link to="/settings">
                  <Settings />
                  <span>{t('common.settings')}</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>
      </SidebarFooter>
    </Sidebar>
  );
};

export default AppSidebar;
