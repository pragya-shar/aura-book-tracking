
import * as React from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import type { Tables } from "@/integrations/supabase/types";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Slider } from "@/components/ui/slider";
import { Textarea } from "@/components/ui/textarea";
import { Loader2 } from "lucide-react";

type BookWithProgress = Tables<'books'> & {
    latestLog?: Tables<'reading_logs'>;
};

interface LogProgressDialogProps {
  book: BookWithProgress;
  children: React.ReactNode;
}

const logProgressSchema = z.object({
  currentPage: z.number().min(0),
  notes: z.string().optional(),
});

export function LogProgressDialog({ book, children }: LogProgressDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof logProgressSchema>>({
    resolver: zodResolver(logProgressSchema),
    defaultValues: {
      currentPage: book.latestLog?.current_page || 0,
      notes: "",
    },
  });
  
  React.useEffect(() => {
    form.reset({
        currentPage: book.latestLog?.current_page || 0,
        notes: "",
    });
  }, [book, form, isOpen]);


  const saveLogMutation = useMutation({
    mutationFn: async (values: z.infer<typeof logProgressSchema>) => {
      if (!user) throw new Error("User not authenticated.");
      if (!book.id) throw new Error("Book ID is missing.");

      const { data, error } = await supabase.from("reading_logs").insert({
        user_id: user.id,
        book_id: book.id,
        current_page: values.currentPage,
        notes: values.notes,
      });

      if (error) throw error;

      const isFinished = book.page_count && values.currentPage >= book.page_count;

      if (isFinished) {
        const { error: updateError } = await supabase
          .from('books')
          .update({ status: 'read', finished_at: new Date().toISOString() })
          .eq('id', book.id);
        
        if (updateError) throw updateError;
      } else if (book.status === 'to-read') {
        const { error: updateError } = await supabase
          .from('books')
          .update({ status: 'reading' })
          .eq('id', book.id);

        if (updateError) throw updateError;
      }

      return data;
    },
    onSuccess: () => {
      toast({
        title: "Progress Saved!",
        description: "Your reading log has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ["reading-progress", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["books", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["statistics", user?.id] });
      setIsOpen(false);
    },
    onError: (error: Error) => {
      toast({
        variant: "destructive",
        title: "Error saving progress",
        description: error.message,
      });
    },
  });

  function onSubmit(values: z.infer<typeof logProgressSchema>) {
    saveLogMutation.mutate(values);
  }

  const currentPage = form.watch("currentPage");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Log Progress for {book.title}</DialogTitle>
          <DialogDescription>
            {book.page_count ? `You are on page ${currentPage} of ${book.page_count}.` : 'Update your reading progress.'}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="currentPage"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Page</FormLabel>
                  <FormControl>
                    <Slider
                      max={book.page_count || 1000}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      disabled={!book.page_count}
                    />
                  </FormControl>
                  {!book.page_count && <p className="text-xs text-muted-foreground">Page count not available for this book.</p>}
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="notes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Notes (Optional)</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Any thoughts on what you just read?" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <DialogFooter>
              <DialogClose asChild>
                <Button type="button" variant="outline">
                  Cancel
                </Button>
              </DialogClose>
              <Button type="submit" disabled={saveLogMutation.isPending}>
                {saveLogMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Save Progress
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
