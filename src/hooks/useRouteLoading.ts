import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { useLoading } from '@/contexts/LoadingContext';

export const useRouteLoading = () => {
  const location = useLocation();
  const { setLoading, setLoadingMessage } = useLoading();
  const previousPathRef = useRef(location.pathname);

  useEffect(() => {
    const currentPath = location.pathname;
    const previousPath = previousPathRef.current;

    // If the path has changed, show loading
    if (currentPath !== previousPath) {
      // Set loading message based on the route
      const routeMessages = {
        '/': 'Loading Home...',
        '/library': 'Loading Library...',
        '/add-book': 'Loading Book Search...',
        '/progress': 'Loading Reading Progress...',
        '/statistics': 'Loading Statistics...',
        '/wallet': 'Loading Wallet...',
        '/admin': 'Loading Admin Panel...',
        '/auth': 'Loading Authentication...'
      };

      const message = routeMessages[currentPath as keyof typeof routeMessages] || 'Loading Page...';
      setLoadingMessage(message);
      setLoading(true);

      // Faster loading time (minimum 150ms for quick UX)
      const timer = setTimeout(() => {
        setLoading(false);
      }, 150);

      // Update the previous path
      previousPathRef.current = currentPath;

      return () => clearTimeout(timer);
    }
  }, [location.pathname, setLoading, setLoadingMessage]);
};

export default useRouteLoading;