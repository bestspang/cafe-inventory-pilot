
/**
 * Demo mode utilities for the Café Inventory app
 */

/**
 * Check if the app is running in demo mode
 * This can be triggered by URL parameter ?demo=true or env variable REACT_APP_MODE=demo
 */
export const isDemoMode = (): boolean => {
  // Check URL parameters
  const urlParams = new URLSearchParams(window.location.search);
  const demoParam = urlParams.get('demo');
  
  // Check environment variable
  const envMode = import.meta.env.VITE_REACT_APP_MODE;
  
  return demoParam === 'true' || envMode === 'demo';
};

/**
 * Gets the demo mode status along with a clean URL without the demo parameter
 */
export const getDemoModeStatus = (): { isDemoMode: boolean; cleanUrl: string } => {
  const isDemoModeActive = isDemoMode();
  
  // Create a clean URL without the demo parameter if needed
  const url = new URL(window.location.href);
  if (url.searchParams.has('demo')) {
    url.searchParams.delete('demo');
  }
  const cleanUrl = url.toString();
  
  return {
    isDemoMode: isDemoModeActive,
    cleanUrl
  };
};
