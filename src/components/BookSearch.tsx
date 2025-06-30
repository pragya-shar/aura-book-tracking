
import React, { useState } from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';

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

  const addTag = (tag: string) => {
    if (!filters.tags.includes(tag)) {
      updateFilters({ tags: [...filters.tags, tag] });
    }
  };

  const removeTag = (tag: string) => {
    updateFilters({ tags: filters.tags.filter(t => t !== tag) });
  };

  const hasActiveFilters = filters.search || filters.status || filters.genre || filters.author || 
    filters.rating[0] > 1 || filters.rating[1] < 5 || filters.pageCount[0] > 0 || filters.pageCount[1] < 1000 ||
    filters.publicationYear[0] > 1900 || filters.publicationYear[1] < new Date().getFullYear() ||
    filters.tags.length > 0 || filters.favorite !== null;

  return (
    <div className="space-y-4 p-4 bg-black/20 border border-amber-500/20 rounded-lg">
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-stone-400 h-4 w-4" />
          <Input
            placeholder="Search books, authors, or descriptions..."
            value={filters.search}
            onChange={(e) => updateFilters({ search: e.target.value })}
            className="pl-10 bg-black/30 border-amber-500/30 text-stone-300 placeholder:text-stone-500"
          />
        </div>
        
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="outline" className="border-amber-500/30 text-stone-300 hover:bg-amber-500/10">
              <Filter className="h-4 w-4 mr-2" />
              Filters
              {hasActiveFilters && (
                <Badge variant="secondary" className="ml-2 bg-amber-500 text-black">
                  Active
                </Badge>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80 bg-black/90 border-amber-500/30 text-stone-300">
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h4 className="font-pixel text-amber-400">Filters</h4>
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="text-stone-400 hover:text-stone-300">
                    Clear All
                  </Button>
                )}
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label className="text-stone-400 text-xs">Status</Label>
                  <Select value={filters.status} onValueChange={(value) => updateFilters({ status: value })}>
                    <SelectTrigger className="bg-black/30 border-amber-500/30">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="to-read">To Read</SelectItem>
                      <SelectItem value="reading">Reading</SelectItem>
                      <SelectItem value="read">Read</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label className="text-stone-400 text-xs">Favorites</Label>
                  <Select value={filters.favorite?.toString() || ""} onValueChange={(value) => updateFilters({ favorite: value === "true" ? true : value === "false" ? false : null })}>
                    <SelectTrigger className="bg-black/30 border-amber-500/30">
                      <SelectValue placeholder="Any" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Any</SelectItem>
                      <SelectItem value="true">Favorites</SelectItem>
                      <SelectItem value="false">Non-favorites</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label className="text-stone-400 text-xs">Genre</Label>
                <Select value={filters.genre} onValueChange={(value) => updateFilters({ genre: value })}>
                  <SelectTrigger className="bg-black/30 border-amber-500/30">
                    <SelectValue placeholder="Any genre" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any genre</SelectItem>
                    {availableGenres.map((genre) => (
                      <SelectItem key={genre} value={genre}>{genre}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-stone-400 text-xs">Author</Label>
                <Select value={filters.author} onValueChange={(value) => updateFilters({ author: value })}>
                  <SelectTrigger className="bg-black/30 border-amber-500/30">
                    <SelectValue placeholder="Any author" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Any author</SelectItem>
                    {availableAuthors.map((author) => (
                      <SelectItem key={author} value={author}>{author}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label className="text-stone-400 text-xs mb-2 block">Rating: {filters.rating[0]} - {filters.rating[1]} stars</Label>
                <Slider
                  value={filters.rating}
                  onValueChange={(value) => updateFilters({ rating: value })}
                  max={5}
                  min={1}
                  step={1}
                  className="[&>span:first-child]:bg-amber-500"
                />
              </div>

              <div>
                <Label className="text-stone-400 text-xs mb-2 block">Page Count: {filters.pageCount[0]} - {filters.pageCount[1]}</Label>
                <Slider
                  value={filters.pageCount}
                  onValueChange={(value) => updateFilters({ pageCount: value })}
                  max={1000}
                  min={0}
                  step={50}
                  className="[&>span:first-child]:bg-amber-500"
                />
              </div>

              <div>
                <Label className="text-stone-400 text-xs">Tags</Label>
                <div className="flex flex-wrap gap-1 mt-2">
                  {filters.tags.map((tag) => (
                    <Badge key={tag} variant="secondary" className="bg-amber-500 text-black text-xs">
                      {tag}
                      <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => removeTag(tag)} />
                    </Badge>
                  ))}
                </div>
                <Select value="" onValueChange={addTag}>
                  <SelectTrigger className="bg-black/30 border-amber-500/30 mt-2">
                    <SelectValue placeholder="Add tag..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableTags.filter(tag => !filters.tags.includes(tag)).map((tag) => (
                      <SelectItem key={tag} value={tag}>{tag}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </PopoverContent>
        </Popover>
      </div>

      {hasActiveFilters && (
        <div className="flex flex-wrap gap-2">
          {filters.search && (
            <Badge variant="outline" className="border-amber-500/30 text-stone-300">
              Search: "{filters.search}"
              <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => updateFilters({ search: '' })} />
            </Badge>
          )}
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
        </div>
      )}
    </div>
  );
};
