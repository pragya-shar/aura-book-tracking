
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import type { Tables } from '@/integrations/supabase/types';

interface SearchFilters {
  search: string;
  status: string;
  genre: string;
  author: string;
  rating: number[];
  pageCount: number[];
  publicationYear: number[];
  tags: string[];
  favorite: boolean | null;
}

export const useEnhancedLibrary = (filters?: SearchFilters) => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['enhanced-books', user?.id, filters],
    queryFn: async () => {
      if (!user) return null;

      let query = supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id);

      // Apply filters
      if (filters) {
        if (filters.search) {
          query = query.or(`title.ilike.%${filters.search}%,authors.cs.{${filters.search}},description.ilike.%${filters.search}%`);
        }
        
        if (filters.status) {
          query = query.eq('status', filters.status);
        }
        
        if (filters.genre) {
          query = query.contains('genres', [filters.genre]);
        }
        
        if (filters.author) {
          query = query.contains('authors', [filters.author]);
        }
        
        if (filters.rating[0] > 1 || filters.rating[1] < 5) {
          query = query.gte('rating', filters.rating[0]).lte('rating', filters.rating[1]);
        }
        
        if (filters.pageCount[0] > 0 || filters.pageCount[1] < 1000) {
          query = query.gte('page_count', filters.pageCount[0]).lte('page_count', filters.pageCount[1]);
        }
        
        if (filters.publicationYear[0] > 1900 || filters.publicationYear[1] < new Date().getFullYear()) {
          query = query.gte('publication_year', filters.publicationYear[0]).lte('publication_year', filters.publicationYear[1]);
        }
        
        if (filters.tags.length > 0) {
          query = query.overlaps('custom_tags', filters.tags);
        }
        
        if (filters.favorite !== null) {
          query = query.eq('is_favorite', filters.favorite);
        }
      }

      const { data, error } = await query.order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data;
    },
    enabled: !!user,
  });
};

export const useLibraryStats = () => {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['library-stats', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: books, error } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id);

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
    enabled: !!user,
  });
};
