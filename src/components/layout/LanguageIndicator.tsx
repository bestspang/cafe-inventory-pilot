
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
