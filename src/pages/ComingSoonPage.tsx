
import React from 'react';
import { useParams, useLocation } from 'react-router-dom';
import ComingSoon from '@/components/layout/ComingSoon';

const ComingSoonPage = () => {
  const params = useParams();
  const location = useLocation();
  
  // Get the page name from the URL path
  const getPageName = () => {
    const path = location.pathname.split('/')[1];
    if (!path) return 'Feature';
    
    return path
      .replace(/-/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };
  
  const pageName = getPageName();
  
  return (
    <ComingSoon
      title={`${pageName} Coming Soon`}
      description={`The ${pageName.toLowerCase()} feature is currently under development and will be available soon.`}
    />
  );
};

export default ComingSoonPage;
