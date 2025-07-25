
import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import type { Tables } from '@/integrations/supabase/types';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { StarRating } from './StarRating';
import { Heart, BookOpen, Calendar, User, Tag, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface BookDetailsDialogProps {
  book: Tables<'books'>;
  children: React.ReactNode;
}

const bookDetailsSchema = z.object({
  rating: z.number().min(1).max(5).optional(),
  personal_review: z.string().optional(),
  custom_tags: z.array(z.string()).optional(),
  reading_context: z.string().optional(),
  is_favorite: z.boolean().optional(),
});

export function BookDetailsDialog({ book, children }: BookDetailsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [newTag, setNewTag] = useState('');
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof bookDetailsSchema>>({
    resolver: zodResolver(bookDetailsSchema),
    defaultValues: {
      rating: book.rating || undefined,
      personal_review: book.personal_review || '',
      custom_tags: book.custom_tags || [],
      reading_context: book.reading_context || '',
      is_favorite: book.is_favorite || false,
    },
  });

  const updateBookMutation = useMutation({
    mutationFn: async (values: z.infer<typeof bookDetailsSchema>) => {
      if (!user) throw new Error("User not authenticated");

      const { error } = await supabase
        .from('books')
        .update(values)
        .eq('id', book.id);

      if (error) throw error;
    },
    onSuccess: () => {
      toast({
        title: "Book updated!",
        description: "Your book details have been saved.",
      });
      queryClient.invalidateQueries({ queryKey: ['books', user?.id] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error updating book",
        description: error.message,
      });
    },
  });

  const addTag = () => {
    if (newTag.trim() && !form.getValues('custom_tags')?.includes(newTag.trim())) {
      const currentTags = form.getValues('custom_tags') || [];
      form.setValue('custom_tags', [...currentTags, newTag.trim()]);
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    const currentTags = form.getValues('custom_tags') || [];
    form.setValue('custom_tags', currentTags.filter(tag => tag !== tagToRemove));
  };

  const onSubmit = (values: z.infer<typeof bookDetailsSchema>) => {
    updateBookMutation.mutate(values);
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent 
        className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto bg-black/90 border-amber-500/30"
        aria-describedby="book-details-description"
      >
        <DialogHeader>
          <DialogTitle className="font-playfair text-amber-400 text-xl">
            {book.title}
          </DialogTitle>
          {book.authors && (
            <p className="text-stone-400 font-playfair italic">
              by {book.authors.join(', ')}
            </p>
          )}
          <DialogDescription id="book-details-description" className="sr-only">
            Book details and reading progress for {book.title}
          </DialogDescription>
        </DialogHeader>

        <div className="flex gap-4 mb-6">
          {book.image_url ? (
            <img 
              src={book.image_url} 
              alt={`Cover of ${book.title}`} 
              className="h-32 w-auto rounded-md object-cover flex-shrink-0" 
            />
          ) : (
            <div className="h-32 w-24 bg-black/20 rounded-md flex items-center justify-center border border-amber-500/20 flex-shrink-0">
              <BookOpen className="w-8 h-8 text-stone-500" />
            </div>
          )}
          
          <div className="flex-1 space-y-2">
            {book.description && (
              <p className="text-stone-300 text-sm line-clamp-4">{book.description}</p>
            )}
            
            <div className="flex flex-wrap gap-2 text-xs text-stone-400">
              {book.publication_year && (
                <div className="flex items-center gap-1">
                  <Calendar className="h-3 w-3" />
                  {book.publication_year}
                </div>
              )}
              {book.page_count && (
                <div className="flex items-center gap-1">
                  <BookOpen className="h-3 w-3" />
                  {book.page_count} pages
                </div>
              )}
              {book.publisher && (
                <div className="flex items-center gap-1">
                  <User className="h-3 w-3" />
                  {book.publisher}
                </div>
              )}
            </div>

            {book.genres && book.genres.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {book.genres.map((genre) => (
                  <Badge key={genre} variant="outline" className="border-amber-500/30 text-stone-300 text-xs">
                    {genre}
                  </Badge>
                ))}
              </div>
            )}
          </div>
        </div>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="rating"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone-400">Your Rating</FormLabel>
                    <FormControl>
                      <div className="flex items-center gap-2">
                        <StarRating
                          rating={field.value || 0}
                          onRatingChange={field.onChange}
                        />
                        {field.value && (
                          <span className="text-sm text-stone-400">
                            {field.value} star{field.value !== 1 ? 's' : ''}
                          </span>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_favorite"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="text-stone-400">Favorite</FormLabel>
                    <FormControl>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={() => field.onChange(!field.value)}
                        className={cn(
                          'flex items-center gap-2',
                          field.value ? 'text-red-400 hover:text-red-300' : 'text-stone-500 hover:text-stone-400'
                        )}
                      >
                        <Heart className={cn('h-4 w-4', field.value && 'fill-current')} />
                        {field.value ? 'Favorite' : 'Add to favorites'}
                      </Button>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="personal_review"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stone-400">Personal Review</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="What did you think of this book?"
                      className="bg-black/30 border-amber-500/30 text-stone-300 placeholder:text-stone-500 min-h-[80px]"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="reading_context"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stone-400">Reading Context</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Where/when did you read this? (e.g., 'Summer 2024', 'Beach vacation')"
                      className="bg-black/30 border-amber-500/30 text-stone-300 placeholder:text-stone-500"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="custom_tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-stone-400">Custom Tags</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-2">
                        {field.value?.map((tag) => (
                          <Badge key={tag} variant="secondary" className="bg-amber-500 text-black text-xs">
                            <Tag className="h-3 w-3 mr-1" />
                            {tag}
                            <X 
                              className="h-3 w-3 ml-1 cursor-pointer hover:text-red-600" 
                              onClick={() => removeTag(tag)} 
                            />
                          </Badge>
                        ))}
                      </div>
                      <div className="flex gap-2">
                        <Input
                          placeholder="Add a tag..."
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                          className="bg-black/30 border-amber-500/30 text-stone-300 placeholder:text-stone-500"
                        />
                        <Button type="button" onClick={addTag} size="sm" variant="outline" className="border-amber-500/30">
                          Add
                        </Button>
                      </div>
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={updateBookMutation.isPending} className="bg-amber-500 text-black hover:bg-amber-600">
                {updateBookMutation.isPending ? 'Saving...' : 'Save Changes'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
