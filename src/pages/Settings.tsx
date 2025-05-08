
import { Helmet } from 'react-helmet-async';
import { FormattedMessage, useIntl } from 'react-intl';
import LanguageSelector from '@/components/settings/LanguageSelector';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Bell, ShieldAlert } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';

const Settings = () => {
  const intl = useIntl();
  
  return (
    <div className="container max-w-4xl mx-auto space-y-6">
      <Helmet>
        <title>{intl.formatMessage({ id: 'settings.title' })} | Good Inventory</title>
      </Helmet>
      
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">
          <FormattedMessage id="settings.title" defaultMessage="Settings" />
        </h1>
        <p className="text-muted-foreground">
          <FormattedMessage 
            id="settings.manage" 
            defaultMessage="Manage your account settings and preferences." 
          />
        </p>
      </div>

      <div className="grid gap-6">
        {/* Language Settings */}
        <LanguageSelector />
        
        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              <FormattedMessage id="settings.notifications" defaultMessage="Notifications" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage 
                id="settings.notifications.description" 
                defaultMessage="Configure how you want to receive notifications" 
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="email-notifications">
                  <FormattedMessage 
                    id="settings.email.notifications" 
                    defaultMessage="Email Notifications" 
                  />
                </Label>
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage 
                    id="settings.email.notifications.description" 
                    defaultMessage="Receive email notifications for important events" 
                  />
                </p>
              </div>
              <Switch id="email-notifications" defaultChecked />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="push-notifications">
                  <FormattedMessage 
                    id="settings.push.notifications" 
                    defaultMessage="Push Notifications" 
                  />
                </Label>
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage 
                    id="settings.push.notifications.description" 
                    defaultMessage="Receive browser push notifications for real-time updates" 
                  />
                </p>
              </div>
              <Switch id="push-notifications" defaultChecked />
            </div>
          </CardContent>
        </Card>
        
        {/* Security Settings */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShieldAlert className="h-5 w-5" />
              <FormattedMessage id="settings.security" defaultMessage="Security" />
            </CardTitle>
            <CardDescription>
              <FormattedMessage 
                id="settings.security.description" 
                defaultMessage="Manage your account security settings" 
              />
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label htmlFor="two-factor">
                  <FormattedMessage 
                    id="settings.two.factor" 
                    defaultMessage="Two-Factor Authentication" 
                  />
                </Label>
                <p className="text-sm text-muted-foreground">
                  <FormattedMessage 
                    id="settings.two.factor.description" 
                    defaultMessage="Add an extra layer of security to your account" 
                  />
                </p>
              </div>
              <Switch id="two-factor" />
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Settings;
