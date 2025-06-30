
import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface SearchFilters {
  search: string;
  status: '' | 'to-read' | 'reading' | 'read';
  genre: string;
  author: string;
  rating: number[];
  pageCount: number[];
  publicationYear: number[];
  tags: string[];
  favorite: boolean | null;
}

interface BookSearchProps {
  onFiltersChange: (filters: SearchFilters) => void;
  availableGenres: string[];
  availableAuthors: string[];
  availableTags: string[];
}

export const BookSearch = ({ onFiltersChange, availableGenres, availableAuthors, availableTags }: BookSearchProps) => {
  const [filters, setFilters] = useState<SearchFilters>({
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

  const updateFilters = (newFilters: Partial<SearchFilters>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);
    onFiltersChange(updated);
  };

  const clearFilters = () => {
    const defaultFilters: SearchFilters = {
      search: '',
      status: '',
      genre: '',
      author: '',
      rating: [1, 5],
      pageCount: [0, 1000],
      publicationYear: [1900, new Date().getFullYear()],
      tags: [],
      favorite: null,
    };
    setFilters(defaultFilters);
    onFiltersChange(defaultFilters);
  };

  const hasActiveFilters = filters.status || filters.genre || filters.author || 
    filters.rating[0] > 1 || filters.rating[1] < 5 || filters.pageCount[0] > 0 || filters.pageCount[1] < 1000 ||
    filters.publicationYear[0] > 1900 || filters.publicationYear[1] < new Date().getFullYear() ||
    filters.tags.length > 0 || filters.favorite !== null;

  return (
    <div className="space-y-4 p-4 bg-black/20 border border-amber-500/20 rounded-lg">
      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.status && (
            <Badge variant="outline" className="border-amber-500/30 text-stone-300">
              Status: {filters.status}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilters({ status: '' })} />
            </Badge>
          )}
          {filters.genre && (
            <Badge variant="outline" className="border-amber-500/30 text-stone-300">
              Genre: {filters.genre}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilters({ genre: '' })} />
            </Badge>
          )}
          {filters.favorite !== null && (
            <Badge variant="outline" className="border-amber-500/30 text-stone-300">
              {filters.favorite ? 'Favorites' : 'Non-favorites'}
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilters({ favorite: null })} />
            </Badge>
          )}
          <Button variant="ghost" size="sm" onClick={clearFilters} className="text-stone-400 hover:text-stone-300">
            Clear All
          </Button>
        </div>
      )}
    </div>
  );
};
