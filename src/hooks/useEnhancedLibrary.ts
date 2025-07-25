import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletUser } from './useWalletUser';
import type { Tables } from '@/integrations/supabase/types';

export const useEnhancedLibrary = () => {
  const { user } = useAuth();
  const walletUser = useWalletUser();

  // Use wallet user ID if available, otherwise fall back to email user
  const userId = walletUser.userId || user?.id;

  return useQuery({
    queryKey: ['enhanced-books', userId],
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

export const useLibraryStats = () => {
  const { user } = useAuth();
  const walletUser = useWalletUser();

  // Use wallet user ID if available, otherwise fall back to email user
  const userId = walletUser.userId || user?.id;

  return useQuery({
    queryKey: ['library-stats', userId],
    queryFn: async () => {
      if (!userId) return null;

      const { data: books, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', userId);

      if (error) throw error;

      // Extract unique values for filtering
      const genres = new Set<string>();
      const authors = new Set<string>();
      const tags = new Set<string>();

      books?.forEach(book => {
        book.genres?.forEach(genre => genres.add(genre));
        book.authors?.forEach(author => authors.add(author));
        book.custom_tags?.forEach(tag => tags.add(tag));
      });

      return {
        books: books || [],
        availableGenres: Array.from(genres).sort(),
        availableAuthors: Array.from(authors).sort(),
        availableTags: Array.from(tags).sort(),
        totalBooks: books?.length || 0,
        readBooks: books?.filter(b => b.status === 'read').length || 0,
        currentlyReading: books?.filter(b => b.status === 'reading').length || 0,
        toReadBooks: books?.filter(b => b.status === 'to-read').length || 0,
        favoriteBooks: books?.filter(b => b.is_favorite).length || 0,
        averageRating: books?.filter(b => b.rating).reduce((acc, b) => acc + (b.rating || 0), 0) / (books?.filter(b => b.rating).length || 1) || 0,
      };
    },
    enabled: !!userId,
  });
};
