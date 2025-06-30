
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

  if (!statsData || statsData.totalBooksRead === 0) {
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

      {/* Reading Progress - Prominent Display */}
      <Card className="mb-6 bg-gradient-to-br from-amber-500/10 to-amber-600/5 border-2 border-amber-500/40 shadow-lg">
        <CardHeader className="pb-4">
          <CardTitle className="font-playfair text-amber-400 flex items-center gap-3 text-lg sm:text-xl">
            <Calendar className="h-5 w-5 sm:h-6 sm:w-6" />
            {statsData.currentYear} Reading Progress
          </CardTitle>
          <p className="text-stone-400 text-sm">Track your monthly reading journey this year</p>
        </CardHeader>
        <CardContent>
          <ChartContainer config={chartConfig} className="h-80 sm:h-96">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={statsData.monthlyData} margin={{ top: 20, right: 20, bottom: 20, left: 20 }}>
                <XAxis 
                  dataKey="month" 
                  tickLine={false} 
                  axisLine={false} 
                  stroke="#A8A29E" 
                  fontSize={12}
                  fontWeight={500}
                />
                <YAxis 
                  stroke="#A8A29E" 
                  fontSize={12} 
                  allowDecimals={false} 
                  width={40}
                  fontWeight={500}
                />
                <Tooltip 
                  cursor={{ stroke: '#F59E0B', strokeWidth: 2, strokeDasharray: '5 5' }} 
                  content={<ChartTooltipContent />}
                  contentStyle={{
                    backgroundColor: 'rgba(0, 0, 0, 0.9)',
                    border: '1px solid #F59E0B',
                    borderRadius: '8px',
                    color: '#F3F4F6'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="books" 
                  stroke="#F59E0B" 
                  strokeWidth={3} 
                  dot={{ fill: "#F59E0B", strokeWidth: 3, r: 6 }}
                  activeDot={{ r: 8, fill: "#F59E0B", stroke: "#1F2937", strokeWidth: 2 }}
                  name="Books Read"
                />
              </LineChart>
            </ResponsiveContainer>
          </ChartContainer>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-6 mb-6">
        <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
          <CardHeader className="pb-2">
            <CardTitle className="font-playfair text-amber-400 flex items-center gap-2 text-sm">
              <BookOpen className="h-4 w-4" />
              Books Read
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-pixel text-amber-400">
              {statsData.totalBooksRead}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
          <CardHeader className="pb-2">
            <CardTitle className="font-playfair text-amber-400 flex items-center gap-2 text-sm">
              <Target className="h-4 w-4" />
              Total Pages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-pixel text-amber-400">
              {statsData.totalPagesRead.toLocaleString()}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
          <CardHeader className="pb-2">
            <CardTitle className="font-playfair text-amber-400 flex items-center gap-2 text-sm">
              <Clock className="h-4 w-4" />
              Avg. Time
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-pixel text-amber-400">
              {statsData.averageDays}
            </div>
            <p className="text-xs text-stone-400">days per book</p>
          </CardContent>
        </Card>

        <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
          <CardHeader className="pb-2">
            <CardTitle className="font-playfair text-amber-400 flex items-center gap-2 text-sm">
              <TrendingUp className="h-4 w-4" />
              Reading Speed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-pixel text-amber-400">
              {statsData.readingVelocity}
            </div>
            <p className="text-xs text-stone-400">pages per day</p>
          </CardContent>
        </Card>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3 sm:gap-6 mt-4 sm:mt-6">
        {/* Rating Distribution */}
        {statsData.ratingData.length > 0 && (
          <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="font-playfair text-amber-400 text-sm sm:text-base">
                Rating Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ChartContainer config={chartConfig} className="h-64 sm:h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.ratingData} margin={{ top: 20, right: 10, bottom: 40, left: 10 }}>
                    <XAxis 
                      dataKey="rating" 
                      tickLine={false} 
                      axisLine={false} 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10} 
                      interval={0}
                    />
                    <YAxis 
                      stroke="hsl(var(--muted-foreground))" 
                      fontSize={10} 
                      allowDecimals={false} 
                      width={30}
                    />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                    <Bar dataKey="count" name="Books" fill="var(--color-count)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {/* Genre Distribution */}
        {statsData.genreData.length > 0 && (
          <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="font-playfair text-amber-400 flex items-center gap-2 text-sm sm:text-base">
                <BookOpen className="h-4 w-4 sm:h-5 sm:w-5" />
                Genre Distribution
              </CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ChartContainer config={chartConfig} className="h-64 sm:h-80">
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

        {/* Author Analysis */}
        {statsData.authorData.length > 0 && (
          <Card className="lg:col-span-2 bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader className="pb-3 sm:pb-4 px-3 sm:px-6">
              <CardTitle className="font-playfair text-amber-400 text-sm sm:text-base">Books by Author</CardTitle>
            </CardHeader>
            <CardContent className="px-3 sm:px-6">
              <ChartContainer config={chartConfig} className="h-72 sm:h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.authorData.slice(0, 10)} layout="vertical" margin={{ top: 20, right: 10, bottom: 5, left: 40 }}>
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={10} width={120} interval={0} />
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
