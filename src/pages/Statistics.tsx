
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Loader2, BarChart as BarChartIcon } from 'lucide-react';
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
        return { timeToFinishData: [], genreData: [], authorData: [] };
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
          return {
            title: book.title,
            days: days > 0 ? days : 1,
          };
        })
        .filter(b => b.days > 0);

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

      return { timeToFinishData, genreData, authorData };
    },
    enabled: !!user,
  });
  
  const timeToFinishConfig = {
    days: { label: "Days", color: "hsl(var(--chart-1))" },
  } satisfies ChartConfig;

  const authorChartConfig = {
    value: { label: "Books", color: "hsl(var(--chart-2))" },
  } satisfies ChartConfig;
  
  const genreColors = ['#FBBF24', '#F59E0B', '#D97706', '#B45309', '#92400E', '#78350F'];


  if (isLoading) {
    return <div className="flex justify-center items-center h-64"><Loader2 className="h-8 w-8 animate-spin text-amber-500" /></div>
  }

  if (isError) {
    return <Alert variant="destructive" className="mt-6"><AlertTitle>Error loading statistics</AlertTitle><AlertDescription>{error.message}</AlertDescription></Alert>
  }

  if (!statsData || (statsData.timeToFinishData.length === 0 && statsData.genreData.length === 0 && statsData.authorData.length === 0)) {
    return (
      <div>
        <h1 className="text-3xl font-pixel tracking-widest text-amber-400">Statistics</h1>
        <p className="text-stone-400 font-playfair italic mt-1">Analyzing the archives of your reading history.</p>
        
        <div className="text-center py-16 border-2 border-dashed border-amber-500/20 rounded-lg mt-6 bg-black/20">
          <BarChartIcon className="mx-auto h-12 w-12 text-stone-500" />
          <h3 className="mt-4 text-lg font-pixel text-amber-400">Finish a book to see your stats</h3>
          <p className="mt-1 text-sm text-stone-400 font-playfair italic">
              Once you've read a book, your statistics will appear here.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-pixel tracking-widest text-amber-400">Statistics</h1>
      <p className="text-stone-400 font-playfair italic mt-1">Analyzing the archives of your reading history.</p>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {statsData.timeToFinishData.length > 0 && (
          <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader><CardTitle className="font-playfair text-amber-400">Time to Finish Books</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={timeToFinishConfig} className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.timeToFinishData} margin={{ top: 20, right: 20, bottom: 5, left: 0 }}>
                    <XAxis dataKey="title" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} interval={0} hide />
                    <YAxis stroke="hsl(var(--muted-foreground))" fontSize={12} />
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent indicator="dot" />} />
                    <Bar dataKey="days" fill="var(--color-days)" radius={4} />
                  </BarChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {statsData.genreData.length > 0 && (
          <Card className="bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader><CardTitle className="font-playfair text-amber-400">Books by Genre</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={{}} className="h-80 mx-auto">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={statsData.genreData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={90} labelLine={false} label={({ cx, cy, midAngle, innerRadius, outerRadius, percent }) => {
                        const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
                        const x = cx + radius * Math.cos(-midAngle * (Math.PI / 180));
                        const y = cy + radius * Math.sin(-midAngle * (Math.PI / 180));
                        return (<text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
                            {`${(percent * 100).toFixed(0)}%`}
                        </text>);
                    }}>
                      {statsData.genreData.map((_entry, index) => (
                        <Cell key={`cell-${index}`} fill={genreColors[index % genreColors.length]} />
                      ))}
                    </Pie>
                    <Tooltip cursor={{ fill: 'hsl(var(--muted))' }} content={<ChartTooltipContent />} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </ChartContainer>
            </CardContent>
          </Card>
        )}

        {statsData.authorData.length > 0 && (
          <Card className="lg:col-span-2 bg-black/30 border border-amber-500/30 text-stone-300">
            <CardHeader><CardTitle className="font-playfair text-amber-400">Books by Author</CardTitle></CardHeader>
            <CardContent>
              <ChartContainer config={authorChartConfig} className="h-96">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={statsData.authorData} layout="vertical" margin={{ top: 20, right: 20, bottom: 5, left: 50 }}>
                    <YAxis type="category" dataKey="name" tickLine={false} axisLine={false} stroke="hsl(var(--muted-foreground))" fontSize={12} width={100} interval={0} />
                    <XAxis type="number" stroke="hsl(var(--muted-foreground))" fontSize={12} allowDecimals={false} />
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
