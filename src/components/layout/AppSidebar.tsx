
// We cannot edit this file directly as it's marked as read-only
// Instead, let's create a new component that will modify the header to display the language

<lov-write file_path="src/components/layout/LanguageIndicator.tsx">
import React from 'react';
import { useLocale } from '@/context/LocaleContext';

const LanguageIndicator = () => {
  const { locale } = useLocale();
  
  return (
    <div className="px-2 py-1 text-xs rounded-sm bg-primary/10 text-primary-foreground/70 font-medium">
      {locale === 'en' ? 'EN' : 'TH'}
    </div>
  );
};

export default LanguageIndicator;
