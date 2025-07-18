import React, { useState } from 'react';
import { Loader2, BookOpen, SortAsc } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { BookCard } from '@/components/BookCard';
import { LibraryStats } from '@/components/LibraryStats';
import { ViewModeToggle, type ViewMode } from '@/components/ViewModeToggle';
import { EmptyLibraryState } from '@/components/EmptyLibraryState';
import { BookSearch } from '@/components/BookSearch';
import { useEnhancedLibrary, useLibraryStats } from '@/hooks/useEnhancedLibrary';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';

const Library = () => {
  const [viewMode, setViewMode] = useState<ViewMode>('grid');
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [searchFilters, setSearchFilters] = useState<any>({
    search: '',
    status: '',
    genre: '',
    author: '',
    rating: [1, 5],
    pageCount: [0, 1000],
    publicationYear: [1900, new Date().getFullYear()],
    tags: [],
    favorite: null,
  });

  const { data: books, isLoading, isError, error } = useEnhancedLibrary();
  const { data: stats } = useLibraryStats();

  // Apply search filters
  const filteredBooks = books ? books.filter(book => {
    if (searchFilters.search && !book.title.toLowerCase().includes(searchFilters.search.toLowerCase()) && 
        !book.authors?.some(author => author.toLowerCase().includes(searchFilters.search.toLowerCase()))) {
      return false;
    }
    if (searchFilters.status && book.status !== searchFilters.status) return false;
    if (searchFilters.genre && !book.genres?.includes(searchFilters.genre)) return false;
    if (searchFilters.author && !book.authors?.includes(searchFilters.author)) return false;
    if (book.rating && (book.rating < searchFilters.rating[0] || book.rating > searchFilters.rating[1])) return false;
    if (book.page_count && (book.page_count < searchFilters.pageCount[0] || book.page_count > searchFilters.pageCount[1])) return false;
    if (book.publication_year && (book.publication_year < searchFilters.publicationYear[0] || book.publication_year > searchFilters.publicationYear[1])) return false;
    if (searchFilters.tags.length > 0 && !searchFilters.tags.some(tag => book.custom_tags?.includes(tag))) return false;
    if (searchFilters.favorite !== null && book.is_favorite !== searchFilters.favorite) return false;
    return true;
  }) : [];

  // Sort books
  const sortedBooks = filteredBooks ? [...filteredBooks].sort((a, b) => {
    let aValue, bValue;
    
    switch (sortBy) {
      case 'title':
        aValue = a.title.toLowerCase();
        bValue = b.title.toLowerCase();
        break;
      case 'author':
        aValue = a.authors?.[0]?.toLowerCase() || '';
        bValue = b.authors?.[0]?.toLowerCase() || '';
        break;
      case 'rating':
        aValue = a.rating || 0;
        bValue = b.rating || 0;
        break;
      case 'publication_year':
        aValue = a.publication_year || 0;
        bValue = b.publication_year || 0;
        break;
      case 'page_count':
        aValue = a.page_count || 0;
        bValue = b.page_count || 0;
        break;
      case 'status':
        const statusOrder = { 'reading': 0, 'to-read': 1, 'read': 2 };
        aValue = statusOrder[a.status];
        bValue = statusOrder[b.status];
        break;
      default:
        aValue = new Date(a.created_at).getTime();
        bValue = new Date(b.created_at).getTime();
    }
    
    if (sortOrder === 'asc') {
      return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
    } else {
      return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
    }
  }) : [];

  const getGridClasses = () => {
    switch (viewMode) {
      case 'compact':
        return 'grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-8 xl:grid-cols-10 gap-2 sm:gap-3';
      case 'list':
        return 'grid grid-cols-1 gap-3 sm:gap-4';
      default:
        return 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2 sm:gap-3';
    }
  };

  return (
    <div className="px-2 sm:px-0">
      <div className="mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel tracking-widest text-amber-400">My Library</h1>
        <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm md:text-base">A collection of tales and whispers from your literary journeys.</p>
      </div>

      {stats && (
        <LibraryStats 
          totalBooks={stats.totalBooks}
          readBooks={stats.readBooks}
          currentlyReading={stats.currentlyReading}
          toReadBooks={stats.toReadBooks}
          favoriteBooks={stats.favoriteBooks}
          averageRating={stats.averageRating}
        />
      )}

      {stats && (
        <BookSearch
          onFiltersChange={setSearchFilters}
          availableGenres={stats.availableGenres}
          availableAuthors={stats.availableAuthors}
          availableTags={stats.availableTags}
        />
      )}

      {/* Simplified view controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 sm:gap-4 mb-6">
        <div className="flex items-center gap-3 sm:gap-4">
          <ViewModeToggle viewMode={viewMode} onViewModeChange={setViewMode} />
          
          <div className="flex items-center gap-2">
            <SortAsc className="h-4 w-4 text-stone-400" />
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-[140px] bg-black/20 border-amber-500/30 text-stone-300 text-xs sm:text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="created_at">Date Added</SelectItem>
                <SelectItem value="title">Title</SelectItem>
                <SelectItem value="author">Author</SelectItem>
                <SelectItem value="rating">Rating</SelectItem>
                <SelectItem value="publication_year">Year</SelectItem>
                <SelectItem value="page_count">Pages</SelectItem>
                <SelectItem value="status">Status</SelectItem>
              </SelectContent>
            </Select>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              className="text-stone-400 hover:text-stone-300 p-2"
            >
              {sortOrder === 'asc' ? '↑' : '↓'}
            </Button>
          </div>
        </div>

        {sortedBooks && (
          <p className="text-xs sm:text-sm text-stone-400">
            {sortedBooks.length} book{sortedBooks.length !== 1 ? 's' : ''} found
          </p>
        )}
      </div>

      {isLoading && (
        <div className="flex justify-center items-center h-32 sm:h-64">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-muted-foreground" />
        </div>
      )}

      {isError && (
        <Alert variant="destructive" className="mx-2 sm:mx-0">
          <AlertTitle>Error fetching books</AlertTitle>
          <AlertDescription className="text-sm">{error.message}</AlertDescription>
        </Alert>
      )}

      {!isLoading && !isError && sortedBooks?.length === 0 && books?.length === 0 && <EmptyLibraryState />}

      {!isLoading && !isError && sortedBooks?.length === 0 && books && books.length > 0 && (
        <div className="text-center py-8">
          <p className="text-stone-400 mb-4">No books match your current filters.</p>
          <Button 
            variant="outline" 
            onClick={() => setSearchFilters({
              search: '',
              status: '',
              genre: '',
              author: '',
              rating: [1, 5],
              pageCount: [0, 1000],
              publicationYear: [1900, new Date().getFullYear()],
              tags: [],
              favorite: null,
            })}
            className="border-amber-500/30 text-amber-400 hover:bg-amber-500/10"
          >
            Clear Filters
          </Button>
        </div>
      )}

      {!isLoading && !isError && sortedBooks && sortedBooks.length > 0 && (
        <div className="pb-20 sm:pb-6">
          <div className={cn(getGridClasses(), 'justify-items-center')}>
            {sortedBooks.map((book) => (
              <BookCard key={book.id} book={book} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Library;
