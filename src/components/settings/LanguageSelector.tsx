
import { useLocale } from '@/context/LocaleContext';
import { Globe } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

export function LanguageSelector() {
  const { locale, setLocale } = useLocale();

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Globe className="h-5 w-5" />
          Language
        </CardTitle>
        <CardDescription>
          Choose your preferred language for the application interface
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Select
          value={locale}
          onValueChange={(value) => setLocale(value as 'en' | 'th')}
        >
          <SelectTrigger className="w-full sm:w-[240px]">
            <SelectValue placeholder="Select language" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="en">English</SelectItem>
            <SelectItem value="th">ไทย (Thai)</SelectItem>
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  );
}

export default LanguageSelector;
