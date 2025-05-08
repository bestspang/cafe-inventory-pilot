
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

export type Locale = 'en' | 'th';
const defaultLocale: Locale = 'en';

type LocaleContextType = {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string) => string;
};

const LocaleContext = createContext<LocaleContextType>({
  locale: defaultLocale,
  setLocale: () => {},
  t: (key) => key,
});

// Simple translations
const translations: Record<Locale, Record<string, string>> = {
  en: {
    // General
    'app.name': 'Lovable Café',
    'common.dashboard': 'Dashboard',
    'common.inventory': 'Inventory',
    'common.stockCheck': 'Stock Check',
    'common.requests': 'Requests',
    'common.branches': 'Branches',
    'common.settings': 'Settings',
    'common.language': 'Language',
    'common.theme': 'Theme',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.loading': 'Loading...',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.actions': 'Actions',
    
    // Languages
    'language.english': 'English',
    'language.thai': 'Thai',
    
    // Settings
    'settings.title': 'Settings',
    'settings.appearance': 'Appearance',
    'settings.language': 'Language',
    'settings.notifications': 'Notifications',
    'settings.profile': 'Profile',
  },
  th: {
    // General
    'app.name': 'คาเฟ่เลิฟเอเบิล',
    'common.dashboard': 'แดชบอร์ด',
    'common.inventory': 'สินค้าคงคลัง',
    'common.stockCheck': 'ตรวจสอบสต็อก',
    'common.requests': 'คำขอ',
    'common.branches': 'สาขา',
    'common.settings': 'ตั้งค่า',
    'common.language': 'ภาษา',
    'common.theme': 'ธีม',
    'common.save': 'บันทึก',
    'common.cancel': 'ยกเลิก',
    'common.loading': 'กำลังโหลด...',
    'common.search': 'ค้นหา',
    'common.filter': 'กรอง',
    'common.sort': 'เรียง',
    'common.actions': 'การดำเนินการ',
    
    // Languages
    'language.english': 'อังกฤษ',
    'language.thai': 'ไทย',
    
    // Settings
    'settings.title': 'ตั้งค่า',
    'settings.appearance': 'รูปลักษณ์',
    'settings.language': 'ภาษา',
    'settings.notifications': 'การแจ้งเตือน',
    'settings.profile': 'โปรไฟล์',
  }
};

export const LocaleProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window !== 'undefined') {
      return (localStorage.getItem('locale') as Locale) || defaultLocale;
    }
    return defaultLocale;
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('locale', locale);
    }
  }, [locale]);

  const t = (key: string): string => {
    return translations[locale][key] || key;
  };

  return (
    <LocaleContext.Provider value={{ locale, setLocale, t }}>
      {children}
    </LocaleContext.Provider>
  );
};

export const useLocale = () => useContext(LocaleContext);
