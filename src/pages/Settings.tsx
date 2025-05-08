
import React from 'react';
import { useLocale, Locale } from '@/context/LocaleContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const Settings = () => {
  const { locale, setLocale, t } = useLocale();

  const handleLocaleChange = (value: string) => {
    setLocale(value as Locale);
  };

  return (
    <div className="container mx-auto py-6 space-y-6 animate-fade-in">
      <h1 className="text-3xl font-bold">{t('settings.title')}</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.appearance')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="language">{t('settings.language')}</Label>
            <Select value={locale} onValueChange={handleLocaleChange}>
              <SelectTrigger id="language" className="w-full sm:w-[240px]">
                <SelectValue placeholder={t('common.language')} />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectItem value="en">{t('language.english')}</SelectItem>
                  <SelectItem value="th">{t('language.thai')}</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Placeholder for future settings sections */}
      <Card>
        <CardHeader>
          <CardTitle>{t('settings.profile')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Profile settings will go here */}
          <p className="text-muted-foreground">Profile settings coming soon...</p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>{t('settings.notifications')}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Notification settings will go here */}
          <p className="text-muted-foreground">Notification settings coming soon...</p>
        </CardContent>
      </Card>
    </div>
  );
};

export default Settings;
