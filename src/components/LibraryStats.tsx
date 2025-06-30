
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
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 mb-6">
      <Card className="bg-black/30 border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-pixel text-amber-400 flex items-center gap-1">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            Total
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold text-stone-300">{totalBooks}</div>
          <p className="text-xs text-stone-500">books</p>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-green-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-pixel text-green-400 flex items-center gap-1">
            <Target className="h-3 w-3 sm:h-4 sm:w-4" />
            Read
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold text-stone-300">{readBooks}</div>
          <p className="text-xs text-stone-500">completed</p>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-pixel text-amber-400 flex items-center gap-1">
            <TrendingUp className="h-3 w-3 sm:h-4 sm:w-4" />
            Reading
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold text-stone-300">{currentlyReading}</div>
          <p className="text-xs text-stone-500">in progress</p>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-blue-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-pixel text-blue-400 flex items-center gap-1">
            <BookOpen className="h-3 w-3 sm:h-4 sm:w-4" />
            To Read
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold text-stone-300">{toReadBooks}</div>
          <p className="text-xs text-stone-500">planned</p>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-red-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-pixel text-red-400 flex items-center gap-1">
            <Heart className="h-3 w-3 sm:h-4 sm:w-4" />
            Favorites
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold text-stone-300">{favoriteBooks}</div>
          <p className="text-xs text-stone-500">loved</p>
        </CardContent>
      </Card>

      <Card className="bg-black/30 border-amber-500/30">
        <CardHeader className="pb-2">
          <CardTitle className="text-xs sm:text-sm font-pixel text-amber-400 flex items-center gap-1">
            <Star className="h-3 w-3 sm:h-4 sm:w-4" />
            Rating
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="text-xl sm:text-2xl font-bold text-stone-300">
            {averageRating ? averageRating.toFixed(1) : '—'}
          </div>
          <p className="text-xs text-stone-500">average</p>
        </CardContent>
      </Card>
    </div>
  );
};
