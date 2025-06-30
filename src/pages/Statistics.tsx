
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, BarChart as BarChartIcon, Clock, BookOpen } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { differenceInDays } from 'date-fns';

const Statistics = () => {
  const { user } = useAuth();

  const { data: statsData, isLoading, isError, error } = useQuery({
    queryKey: ['statistics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: readBooks, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'read');

      if (booksError) throw booksError;
      if (!readBooks || readBooks.length === 0) {
        return { averageDays: 0, genreData: [], authorData: [] };
      }

      const bookIds = readBooks.map((b) => b.id);

      const { data: logs, error: logsError } = await supabase
        .from('reading_logs')
        .select('book_id, created_at')
        .in('book_id', bookIds)
        .order('created_at', { ascending: true });

      if (logsError) throw logsError;

      const firstLogMap = new Map<string, string>();
      if (logs) {
        for (const log of logs) {
          if (!firstLogMap.has(log.book_id)) {
            firstLogMap.set(log.book_id, log.created_at);
          }
        }
      }

      const timeToFinishData = readBooks
        .map((book) => {
          const startDate = firstLogMap.get(book.id);
          const finishDate = book.finished_at;
          let days = 0;
          if (startDate && finishDate) {
            days = differenceInDays(new Date(finishDate), new Date(startDate));
          }
          return days > 0 ? days : 1;
        })
        .filter(days => days > 0);

      const averageDays = timeToFinishData.length > 0 
        ? Math.round(timeToFinishData.reduce((sum, days) => sum + days, 0) / timeToFinishData.length)
        : 0;

      const genreCounts = new Map<string, number>();
      readBooks.forEach((book) => {
        if (book.genres) {
          book.genres.forEach((genre) => {
            genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
          });
        }
      });
      const genreData = Array.from(genreCounts.entries()).map(([name, value]) => ({ name, value }));

      const authorCounts = new Map<string, number>();
      readBooks.forEach((book) => {
        if (book.authors) {
          book.authors.forEach((author) => {
            authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
          });
        }
      });
      const authorData = Array.from(authorCounts.entries()).map(([name, value]) => ({ name, value }));

      return { averageDays, genreData, authorData };
    },
    enabled: !!user,
  });
  
  const authorChartConfig = {
    value: { label: "Books", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;

  const genreChartConfig = {
    value: { label: "Books", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;
  
  const genreColors = ['#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'];

  if (isLoading) {
    return (
      <div className="px-2 sm:px-0">
        <div className="flex justify-center items-center h-32 sm:h-64">
          <Loader2 className="h-6 w-6 sm:h-8 sm:w-8 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-2 sm:px-0">
        <Alert variant="destructive" className="mt-4 sm:mt-6">
          <AlertTitle>Error loading statistics</AlertTitle>
          <AlertDescription className="text-sm">{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!statsData || (statsData.averageDays === 0 && statsData.genreData.length === 0 && statsData.authorData.length === 0)) {
    return (
      <div className="px-2 sm:px-0 pb-20 sm:pb-6">
        <div className="mb-4 sm:mb-6">
          <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel tracking-widest text-amber-400">Statistics</h1>
          <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm md:text-base">Analyzing the archives of your reading history.</p>
        </div>
        
        <div className="text-center py-12 sm:py-16 border-2 border-dashed border-amber-500/20 rounded-lg mt-4 sm:mt-6 bg-black/20">
          <BarChartIcon className="mx-auto h-8 w-8 sm:h-12 sm:w-12 text-stone-500" />
          <h3 className="mt-3 sm:mt-4 text-base sm:text-lg font-pixel text-amber-400">Finish a book to see your stats</h3>
          <p className="mt-1 text-xs sm:text-sm text-stone-400 font-playfair italic px-4">
              Once you've read a book, your statistics will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-0 pb-20 sm:pb-6">
      <div className="mb-4 sm:mb-6">
        <h1 className="text-xl sm:text-2xl md:text-3xl font-pixel tracking-widest text-amber-400">Statistics</h1>
        <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm md:text-base">Analyzing the archives of your reading history.</p>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-6">
        {statsData.averageDays > 0 && (
          <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="font-playfair text-amber-400 flex items-center gap-2 text-sm sm:text-base">
                <Clock className="h-4 w-4 sm:h-5 sm:w-5" />
                Average Reading Time
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <div className="text-center py-6 sm:py-8">
                <div className="text-3xl sm:text-4xl font-pixel text-amber-400 mb-2">
                  {statsData.averageDays}
                </div>
                <div className="text-base sm:text-lg text-stone-300 font-playfair">
                  {statsData.averageDays === 1 ? 'day' : 'days'} per book
                </div>
                <p className="text-xs sm:text-sm text-stone-400 mt-2 font-playfair italic">
                  Your average time to complete a book
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {statsData.genreData.length > 0 && (
          <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="font-playfair text-amber-400 flex items-center gap-2 text-sm sm:text-base">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                Genre Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ChartContainer config={genreChartConfig} className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.genreData} margin={{ top: 20, right: 10, bottom: 40, left: 10 }}>
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10} 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={40}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10} 
                      allowDecimals={false} 
                      width={30}
                    />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name="Books" fill="var(--color-value)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {statsData.authorData.length > 0 && (
          <Card className="lg:col-span-2 bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="font-playfair text-amber-400 text-sm sm:text-base">Books by Author</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ChartContainer config={authorChartConfig} className="h-72 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.authorData} layout="vertical" margin={{ top: 20, right: 10, bottom: 5, left: 40 }}>
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={10} width={80} interval={0} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={10} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="value" name="Books" fill="var(--color-value)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
export default Statistics;
