
import React from 'react';
import { BookOpen, Heart, Star, Target, TrendingUp } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

interface LibraryStatsProps {
  totalBooks: number;
  readBooks: number;
  currentlyReading: number;
  toReadBooks: number;
  favoriteBooks: number;
  averageRating: number;
}

export const LibraryStats = ({ 
  totalBooks, 
  readBooks, 
  currentlyReading, 
  toReadBooks, 
  favoriteBooks, 
  averageRating 
}: LibraryStatsProps) => {
  const readingProgress = totalBooks > 0 ? (readBooks / totalBooks) * 100 : 0;

  return (
    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 sm:gap-3 mb-4 sm:mb-6">
      <Card className="bg-black/30 border-amber-500/30">
        <CardContent className="p-2 sm:p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <BookOpen className="h-3 w-3 text-amber-400 mr-1" />
            <span className="text-xs font-pixel text-amber-400">Total</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-300">{totalBooks}</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-green-500/30">
        <CardContent className="p-2 sm:p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Target className="h-3 w-3 text-green-400 mr-1" />
            <span className="text-xs font-pixel text-green-400">Read</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-300">{readBooks}</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-amber-500/30">
        <CardContent className="p-2 sm:p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <TrendingUp className="h-3 w-3 text-amber-400 mr-1" />
            <span className="text-xs font-pixel text-amber-400">Reading</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-300">{currentlyReading}</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-blue-500/30">
        <CardContent className="p-2 sm:p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <BookOpen className="h-3 w-3 text-blue-400 mr-1" />
            <span className="text-xs font-pixel text-blue-400">To Read</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-300">{toReadBooks}</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-red-500/30">
        <CardContent className="p-2 sm:p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Heart className="h-3 w-3 text-red-400 mr-1" />
            <span className="text-xs font-pixel text-red-400">Favorites</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-300">{favoriteBooks}</div>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-amber-500/30">
        <CardContent className="p-2 sm:p-3 text-center">
          <div className="flex items-center justify-center mb-1">
            <Star className="h-3 w-3 text-amber-400 mr-1" />
            <span className="text-xs font-pixel text-amber-400">Rating</span>
          </div>
          <div className="text-lg sm:text-xl font-bold text-stone-300">
            {averageRating ? averageRating.toFixed(1) : '—'}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
