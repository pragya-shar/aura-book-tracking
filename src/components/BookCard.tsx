
import React from 'react';
import type { Tables } from '@/integrations/supabase/types';
import { BookOpen, Heart, Star, Tag, Calendar } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { BookDetailsDialog } from './BookDetailsDialog';
import { cn } from '@/lib/utils';

interface BookCardProps {
  book: Tables<'books'>;
}

export const BookCard = ({ book }: BookCardProps) => {
  const statusColors = {
    'to-read': 'border-blue-500/30',
    'reading': 'border-amber-500/30',
    'read': 'border-green-500/30'
  };

  return (
    <BookDetailsDialog book={book}>
      <div className={cn(
        'group relative bg-black/20 border-2 rounded-lg p-3 cursor-pointer transition-all duration-300 hover:bg-black/30 hover:border-amber-500/50 hover:shadow-lg',
        statusColors[book.status]
      )}>
        {/* Favorite heart indicator */}
        {book.is_favorite && (
          <Heart className="absolute top-2 right-2 h-4 w-4 text-red-400 fill-current z-10" />
        )}

        {/* Book cover or placeholder */}
        <div className="relative mb-3">
          {book.image_url ? (
            <img 
              src={book.image_url} 
              alt={`Cover of ${book.title}`} 
              className="w-full h-32 sm:h-40 object-cover rounded-md" 
            />
          ) : (
            <div className="w-full h-32 sm:h-40 bg-black/30 rounded-md flex items-center justify-center border border-amber-500/20">
              <BookOpen className="w-8 h-8 text-stone-500" />
            </div>
          )}
          
          {/* Status badge */}
          <Badge 
            variant="secondary" 
            className={cn(
              'absolute bottom-2 left-2 text-xs',
              book.status === 'reading' && 'bg-amber-500 text-black',
              book.status === 'read' && 'bg-green-500 text-black',
              book.status === 'to-read' && 'bg-blue-500 text-white'
            )}
          >
            {book.status === 'to-read' ? 'To Read' : book.status === 'reading' ? 'Reading' : 'Read'}
          </Badge>
        </div>

        {/* Book information */}
        <div className="space-y-2">
          <h3 className="font-playfair text-amber-400 text-sm font-medium line-clamp-2 group-hover:text-amber-300 transition-colors">
            {book.title}
          </h3>
          
          {book.authors && book.authors.length > 0 && (
            <p className="text-xs text-stone-400 line-clamp-1">
              by {book.authors.join(', ')}
            </p>
          )}

          {/* Rating */}
          {book.rating && (
            <div className="flex items-center gap-1">
              <StarRating rating={book.rating} readonly size="sm" />
              <span className="text-xs text-stone-400">({book.rating})</span>
            </div>
          )}

          {/* Series info */}
          {book.series_name && (
            <div className="flex items-center gap-1 text-xs text-stone-400">
              <BookOpen className="h-3 w-3" />
              <span className="line-clamp-1">
                {book.series_name}
                {book.series_order && ` #${book.series_order}`}
              </span>
            </div>
          )}

          {/* Publication year */}
          {book.publication_year && (
            <div className="flex items-center gap-1 text-xs text-stone-500">
              <Calendar className="h-3 w-3" />
              {book.publication_year}
            </div>
          )}

          {/* Custom tags */}
          {book.custom_tags && book.custom_tags.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {book.custom_tags.slice(0, 2).map((tag) => (
                <Badge key={tag} variant="outline" className="border-amber-500/30 text-stone-400 text-xs">
                  <Tag className="h-2 w-2 mr-1" />
                  {tag}
                </Badge>
              ))}
              {book.custom_tags.length > 2 && (
                <Badge variant="outline" className="border-amber-500/30 text-stone-400 text-xs">
                  +{book.custom_tags.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Reading context */}
          {book.reading_context && (
            <p className="text-xs text-stone-500 italic line-clamp-1">
              {book.reading_context}
            </p>
          )}
        </div>
      </div>
    </BookDetailsDialog>
  );
};
