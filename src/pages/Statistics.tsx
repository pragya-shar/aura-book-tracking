import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, BarChart as BarChartIcon, Clock, BookOpen, Target, Calendar, TrendingUp } from 'lucide-react';
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
  LineChart,
  Line,
} from 'recharts';
import {
  ChartContainer,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart';
import { differenceInDays, format, startOfMonth, endOfMonth, eachMonthOfInterval, startOfYear, endOfYear } from 'date-fns';

const Statistics = () => {
  const { user } = useAuth();

  const { data: statsData, isLoading, isError, error } = useQuery({
    queryKey: ['enhanced-statistics', user?.id],
    queryFn: async () => {
      if (!user) return null;

      const { data: readBooks, error: booksError } = await supabase
        .from('books')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'read');

      if (booksError) throw booksError;
      if (!readBooks || readBooks.length === 0) {
        return { 
          averageDays: 0, 
          genreData: [], 
          authorData: [], 
          ratingData: [],
          monthlyData: [],
          yearlyGoals: [],
          totalPagesRead: 0,
          averageRating: 0,
          readingVelocity: 0
        };
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

      // Genre analysis
      const genreCounts = new Map<string, number>();
      readBooks.forEach((book) => {
        if (book.genres) {
          book.genres.forEach((genre) => {
            genreCounts.set(genre, (genreCounts.get(genre) || 0) + 1);
          });
        }
      });
      const genreData = Array.from(genreCounts.entries()).map(([name, value]) => ({ name, value }));

      // Author analysis
      const authorCounts = new Map<string, number>();
      readBooks.forEach((book) => {
        if (book.authors) {
          book.authors.forEach((author) => {
            authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
          });
        }
      });
      const authorData = Array.from(authorCounts.entries()).map(([name, value]) => ({ name, value }));

      // Rating distribution
      const ratingCounts = new Map<number, number>();
      readBooks.forEach((book) => {
        if (book.rating) {
          ratingCounts.set(book.rating, (ratingCounts.get(book.rating) || 0) + 1);
        }
      });
      const ratingData = Array.from(ratingCounts.entries()).map(([rating, count]) => ({ 
        rating: `${rating} star${rating !== 1 ? 's' : ''}`, 
        count 
      }));

      // Current year reading progress (January to December)
      const currentYear = new Date().getFullYear();
      const yearStart = startOfYear(new Date(currentYear, 0, 1));
      const yearEnd = endOfYear(new Date(currentYear, 11, 31));
      const months = eachMonthOfInterval({ start: yearStart, end: yearEnd });
      
      const monthlyData = months.map(month => {
        const monthStart = startOfMonth(month);
        const monthEnd = endOfMonth(month);
        
        const booksReadThisMonth = readBooks.filter(book => {
          if (!book.finished_at) return false;
          const finishedDate = new Date(book.finished_at);
          return finishedDate >= monthStart && finishedDate <= monthEnd;
        });

        return {
          month: format(month, 'MMM'),
          books: booksReadThisMonth.length,
          pages: booksReadThisMonth.reduce((sum, book) => sum + (book.page_count || 0), 0)
        };
      });

      // Calculate additional metrics
      const totalPagesRead = readBooks.reduce((sum, book) => sum + (book.page_count || 0), 0);
      const averageRating = readBooks.filter(b => b.rating).reduce((sum, book) => sum + (book.rating || 0), 0) / (readBooks.filter(b => b.rating).length || 1);
      const readingVelocity = averageDays > 0 ? Math.round((readBooks.reduce((sum, book) => sum + (book.page_count || 300), 0) / readBooks.length) / averageDays) : 0;

      return { 
        averageDays, 
        genreData, 
        authorData, 
        ratingData,
        monthlyData,
        totalPagesRead,
        averageRating,
        readingVelocity,
        totalBooksRead: readBooks.length,
        currentYear
      };
    },
    enabled: !!user,
  });
  
  const chartConfig = {
    value: { label: "Books", color: "hsl(var(--chart-2))" },
    count: { label: "Books", color: "hsl(var(--chart-1))" },
    books: { label: "Books", color: "#F59E0B" },
    pages: { label: "Pages", color: "#10B981" },
  } satisfies ChartConfig;
  
  const ratingColors = ['#EF4444', '#F97316', '#EAB308', '#22C55E', '#10B981'];

  if (isLoading) {
    return (
      <div className="px-2 sm:px-4">
        <div className="flex justify-center items-center h-32">
          <Loader2 className="h-6 w-6 animate-spin text-amber-500" />
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="px-2 sm:px-4">
        <Alert variant="destructive" className="mt-4">
          <AlertTitle>Error loading statistics</AlertTitle>
          <AlertDescription className="text-sm">{error.message}</AlertDescription>
        </Alert>
      </div>
    );
  }

  if (!statsData || statsData.totalBooksRead === 0) {
    return (
      <div className="px-2 sm:px-4 pb-16 sm:pb-6">
        <div className="mb-3">
          <h1 className="text-lg sm:text-xl md:text-2xl font-pixel tracking-widest text-amber-400">Statistics</h1>
          <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm">Analyzing your reading history.</p>
        </div>
        
        <div className="text-center py-8 border-2 border-dashed border-amber-500/20 rounded-lg bg-black/20">
          <BarChartIcon className="mx-auto h-8 w-8 text-stone-500" />
          <h3 className="mt-3 text-sm sm:text-base font-pixel text-amber-400">Finish a book to see your stats</h3>
          <p className="mt-1 text-xs text-stone-400 font-playfair italic px-4">
              Once you've read a book, your statistics will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="px-2 sm:px-4 pb-16 sm:pb-6">
      <div className="mb-3">
        <h1 className="text-lg sm:text-xl md:text-2xl font-pixel tracking-widest text-amber-400">Statistics</h1>
        <p className="text-stone-400 font-playfair italic mt-1 text-xs sm:text-sm">Analyzing your reading history.</p>
      </div>

      {/* Reading Progress - Compact Display */}
      <Card className="mb-4 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/40">
        <CardHeader className="pb-2 px-3 pt-3">
          <CardTitle className="font-playfair text-amber-400 flex items-center gap-2 text-base sm:text-lg">
            <Calendar className="h-4 w-4" />
            {statsData.currentYear} Reading Progress
          </CardTitle>
        </CardHeader>
        <CardContent className="px-3 pb-3">
          <ChartContainer config={chartConfig} className="h-48 sm:h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsData.monthlyData} margin={{ top: 10, right: 10, bottom: 10, left: 10 }}>
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#A8A29E" 
                  fontSize={10}
                />
                <YAxis 
                  stroke="#A8A29E" 
                  fontSize={10} 
                  allowDecimals={false} 
                  width={25}
                />
                <Tooltip 
                  cursor={{ stroke: '#F59E0B', strokeWidth: 2, strokeDasharray: '5 5' }} 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #F59E0B',
                    borderRadius: '6px',
                    color: '#F3F4F6',
                    fontSize: '12px'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="books" 
                  stroke="#F59E0B" 
                  strokeWidth={2} 
                  dot={{ fill: "#F59E0B", strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, fill: "#F59E0B", stroke: "#1F2937", strokeWidth: 2 }}
                  name="Books Read"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Key Metrics - Compact */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3 mb-4">
        <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
          <CardHeader className="pb-1 px-2 pt-2">
            <CardTitle className="font-playfair text-amber-400 flex items-center gap-1 text-xs">
              <BookOpen className="h-3 w-3" />
              Books
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <div className="text-lg font-pixel text-amber-400">
              {statsData.totalBooksRead}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
          <CardHeader className="pb-1 px-2 pt-2">
            <CardTitle className="font-playfair text-amber-400 flex items-center gap-1 text-xs">
              <Target className="h-3 w-3" />
              Pages
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <div className="text-lg font-pixel text-amber-400">
              {statsData.totalPagesRead.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
          <CardHeader className="pb-1 px-2 pt-2">
            <CardTitle className="font-playfair text-amber-400 flex items-center gap-1 text-xs">
              <Clock className="h-3 w-3" />
              Avg Time
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <div className="text-lg font-pixel text-amber-400">
              {statsData.averageDays}
            </div>
            <p className="text-xs text-stone-400">days</p>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
          <CardHeader className="pb-1 px-2 pt-2">
            <CardTitle className="font-playfair text-amber-400 flex items-center gap-1 text-xs">
              <TrendingUp className="h-3 w-3" />
              Speed
            </CardTitle>
          </CardHeader>
          <CardContent className="px-2 pb-2">
            <div className="text-lg font-pixel text-amber-400">
              {statsData.readingVelocity}
            </div>
            <p className="text-xs text-stone-400">pg/day</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 mt-3">
        {/* Rating Distribution */}
        {statsData.ratingData.length > 0 && (
          <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="font-playfair text-amber-400 text-sm">
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <ChartContainer config={chartConfig} className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.ratingData} margin={{ top: 10, right: 5, bottom: 30, left: 5 }}>
                    <XAxis 
                      dataKey="rating" 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={9} 
                      interval={0}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={9} 
                      allowDecimals={false} 
                      width={25}
                    />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                    <Bar dataKey="count" name="Books" fill="var(--color-count)" radius={3} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Genre Distribution */}
        {statsData.genreData.length > 0 && (
          <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="font-playfair text-amber-400 flex items-center gap-2 text-sm">
                <BookOpen className="h-4 w-4" />
                Genre Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <ChartContainer config={chartConfig} className="h-48 sm:h-56">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.genreData} margin={{ top: 10, right: 5, bottom: 30, left: 5 }}>
                    <XAxis 
                      dataKey="name" 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={9} 
                      interval={0}
                      angle={-45}
                      textAnchor="end"
                      height={30}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={9} 
                      allowDecimals={false} 
                      width={25}
                    />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                    <Bar dataKey="value" name="Books" fill="var(--color-value)" radius={3} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Author Analysis */}
        {statsData.authorData.length > 0 && (
          <Card className="lg:col-span-2 bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader className="pb-2 px-3 pt-3">
              <CardTitle className="font-playfair text-amber-400 text-sm">Books by Author</CardTitle>
            </CardHeader>
            <CardContent className="px-3 pb-3">
              <ChartContainer config={chartConfig} className="h-56 sm:h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.authorData.slice(0, 10)} layout="vertical" margin={{ top: 10, right: 5, bottom: 5, left: 80 }}>
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={9} width={75} interval={0} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={9} allowDecimals={false} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="value" name="Books" fill="var(--color-value)" radius={3} />
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
