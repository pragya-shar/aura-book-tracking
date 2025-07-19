
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletUser } from './useWalletUser';

export const useLibraryBooks = () => {
  const { user } = useAuth();
  const walletUser = useWalletUser();

  // Use wallet user ID if available, otherwise fall back to email user
  const userId = walletUser.userId || user?.id;

  return useQuery({
    queryKey: ['books', userId],
    queryFn: async () => {
      if (!userId) return null;
      const { data, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }
      return data;
    },
    enabled: !!userId,
  });
};
