
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card';
import { BookOpen, MoreHorizontal, Trash2, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from '@/integrations/supabase/types';

interface BookCardProps {
  book: Tables<'books'>;
}

const BookStatusBadge = ({ status }: { status: 'to-read' | 'reading' | 'read' }) => {
  if (status === 'reading') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-amber-900/50 text-amber-300 border border-amber-500/50">Reading</span>;
  }
  if (status === 'read') {
      return <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-stone-700/80 text-stone-300 border border-stone-500/50">Read</span>;
  }
  return null;
};

export const BookCard = ({ book }: BookCardProps) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const navigate = useNavigate();

  const updateBookStatusMutation = useMutation({
    mutationFn: async ({ bookId, status }: { bookId: string, status: 'to-read' | 'reading' | 'read' }) => {
      const { error } = await supabase
        .from('books')
        .update({ status })
        .eq('id', bookId);
      if (error) throw error;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ['books', user?.id] });
      toast({ title: `Book marked as ${variables.status.replace('-', ' ')}!` });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: "Error updating status", description: error.message });
    }
  });

  const deleteBookMutation = useMutation({
    mutationFn: async (bookId: string) => {
      // Also delete reading_logs for this book
      await supabase.from('reading_logs').delete().eq('book_id', bookId);
      const { error } = await supabase.from('books').delete().eq('id', bookId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['books', user?.id] });
      toast({ title: "Book removed from library" });
    },
    onError: (error) => {
      toast({ variant: 'destructive', title: "Error removing book", description: error.message });
    }
  });

  const handleCardClick = () => {
    navigate('/progress');
  };

  const handleDropdownClick = (e: React.MouseEvent) => {
    e.stopPropagation();
  };

  return (
    <Card className="flex flex-col bg-black/30 border border-amber-500/30 text-stone-300 hover:border-amber-500/60 transition-colors duration-300 group relative cursor-pointer" onClick={handleCardClick}>
       <div className="absolute top-2 right-2 z-10 opacity-0 group-hover:opacity-100 transition-opacity" onClick={handleDropdownClick}>
         <DropdownMenu>
           <DropdownMenuTrigger asChild>
             <Button variant="ghost" size="icon" className="h-8 w-8 bg-black/50 hover:bg-black/80 text-stone-300 hover:text-amber-400">
               <MoreHorizontal className="h-4 w-4" />
             </Button>
           </DropdownMenuTrigger>
           <DropdownMenuContent align="end" className="bg-black/80 border border-amber-500/30 text-stone-300 backdrop-blur-sm">
             {book.status !== 'reading' && (
               <DropdownMenuItem onClick={() => updateBookStatusMutation.mutate({ bookId: book.id, status: 'reading' })} className="hover:!bg-amber-500/10 focus:!bg-amber-500/10 hover:!text-amber-400 focus:!text-amber-400 cursor-pointer">
                 <BookOpen className="mr-2" />
                 <span>Mark as Reading</span>
               </DropdownMenuItem>
             )}
             {book.status !== 'read' && (
              <DropdownMenuItem onClick={() => updateBookStatusMutation.mutate({ bookId: book.id, status: 'read' })} className="hover:!bg-amber-500/10 focus:!bg-amber-500/10 hover:!text-amber-400 focus:!text-amber-400 cursor-pointer">
                 <Check className="mr-2" />
                 <span>Mark as Read</span>
               </DropdownMenuItem>
             )}
             {book.status !== 'to-read' && (
              <DropdownMenuItem onClick={() => updateBookStatusMutation.mutate({ bookId: book.id, status: 'to-read' })} className="hover:!bg-amber-500/10 focus:!bg-amber-500/10 hover:!text-amber-400 focus:!text-amber-400 cursor-pointer">
                 <BookOpen className="mr-2" />
                 <span>Mark as To Read</span>
               </DropdownMenuItem>
             )}
             <DropdownMenuSeparator className="bg-amber-500/20" />
             <DropdownMenuItem className="text-red-400 hover:!text-red-400 focus:text-red-400 hover:!bg-red-500/10 focus:!bg-red-500/10 cursor-pointer" onClick={() => deleteBookMutation.mutate(book.id)}>
               <Trash2 className="mr-2" />
               <span>Remove</span>
             </DropdownMenuItem>
           </DropdownMenuContent>
         </DropdownMenu>
       </div>
      <CardHeader className="p-0">
        {book.image_url ? (
            <img
                src={book.image_url}
                alt={`Cover of ${book.title}`}
                className="rounded-t-lg object-cover aspect-[2/3] w-full"
            />
        ) : (
          <div className="aspect-[2/3] w-full bg-black/20 rounded-t-lg flex items-center justify-center border-b border-amber-500/20">
            <BookOpen className="w-10 h-10 text-stone-500" />
          </div>
        )}
      </CardHeader>
      <CardContent className="p-4 flex-grow">
        <CardTitle className="line-clamp-2 text-base font-semibold font-playfair text-amber-400">{book.title}</CardTitle>
        <CardDescription className="line-clamp-1 text-sm text-stone-400">{book.authors?.join(', ')}</CardDescription>
      </CardContent>
      <CardFooter className="p-4 pt-0 text-xs text-stone-500 flex justify-between items-center">
        <span>{book.page_count ? `${book.page_count} pages` : ''}</span>
        <BookStatusBadge status={book.status} />
      </CardFooter>
    </Card>
  );
};
