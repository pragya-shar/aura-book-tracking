import { useLoading } from '@/contexts/LoadingContext';

/**
 * Hook for manually controlling the global loading state.
 * Useful for showing loading during async operations, API calls, etc.
 * 
 * @example
 * const { showLoading, hideLoading } = useManualLoading();
 * 
 * const handleSubmit = async () => {
 *   showLoading('Saving changes...');
 *   try {
 *     await saveData();
 *   } finally {
 *     hideLoading();
 *   }
 * };
 */
export const useManualLoading = () => {
  const { setLoading, setLoadingMessage } = useLoading();

  const showLoading = (message = 'Loading...') => {
    setLoadingMessage(message);
    setLoading(true);
  };

  const hideLoading = () => {
    setLoading(false);
  };

  return {
    showLoading,
    hideLoading
  };
};

export default useManualLoading;