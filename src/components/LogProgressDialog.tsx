
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
import { Loader2, Trophy, Coins } from "lucide-react";

type BookWithProgress = Tables<'books'> & {
    latestLog?: Tables<'reading_logs'>;
};

interface LogProgressDialogProps {
  book: BookWithProgress;
  children: React.ReactNode;
}

const logProgressSchema = z.object({
  currentPage: z.number().min(0),
});

export function LogProgressDialog({ book, children }: LogProgressDialogProps) {
  const [isOpen, setIsOpen] = React.useState(false);
  const [showCelebration, setShowCelebration] = React.useState(false);
  const [rewardAmount, setRewardAmount] = React.useState(0);
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Use book's page count or default to 500 if not available
  const maxPages = book.page_count || 500;

  const form = useForm<z.infer<typeof logProgressSchema>>({
    resolver: zodResolver(logProgressSchema),
    defaultValues: {
      currentPage: book.latestLog?.current_page || 0,
    },
  });
  
  React.useEffect(() => {
    form.reset({
        currentPage: book.latestLog?.current_page || 0,
    });
  }, [book, form, isOpen]);

  const saveLogMutation = useMutation({
    mutationFn: async (values: z.infer<typeof logProgressSchema>) => {
      if (!user) throw new Error("User not authenticated.");
      if (!book.id) throw new Error("Book ID is missing.");

      const isBookCompleted = book.page_count && values.currentPage >= book.page_count;
      
      const { data, error } = await supabase.from("reading_logs").insert({
        user_id: user.id,
        book_id: book.id,
        current_page: values.currentPage,
        notes: null,
        reward_created: false, // Will be set to true by trigger if completion detected
        reward_amount: isBookCompleted ? book.page_count : null,
        completed_at: isBookCompleted ? new Date().toISOString() : null,
      });

      if (error) throw error;

      const isFinished = book.page_count && values.currentPage >= book.page_count;

      if (isFinished) {
        const { error: updateError } = await supabase
          .from('books')
          .update({ status: 'read', finished_at: new Date().toISOString() })
          .eq('id', book.id);
        
        if (updateError) throw updateError;
        
        // Set reward amount for celebration
        setRewardAmount(book.page_count || 0);
      } else {
        // If logging progress that's not finished, ensure book is marked as reading
        const { error: updateError } = await supabase
          .from('books')
          .update({ status: 'reading', finished_at: null })
          .eq('id', book.id);

        if (updateError) throw updateError;
      }

      return { data, isFinished };
    },
    onSuccess: (result) => {
      if (result.isFinished) {
        // Show celebration before closing dialog
        setShowCelebration(true);
        // Close progress dialog and show celebration after a short delay
        setTimeout(() => {
          setIsOpen(false);
        }, 500);
      } else {
        toast({
          title: "Progress Saved!",
          description: "Your reading log has been updated.",
        });
        setIsOpen(false);
      }
      
      queryClient.invalidateQueries({ queryKey: ["reading-progress", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["books", user?.id] });
      queryClient.invalidateQueries({ queryKey: ["statistics", user?.id] });
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
  const isCompleting = book.page_count && currentPage >= book.page_count;

  return (
    <>
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>{children}</DialogTrigger>
        <DialogContent 
          className="sm:max-w-[425px]"
          aria-describedby="log-progress-description"
        >
          <DialogHeader>
            <DialogTitle>Log Progress for {book.title}</DialogTitle>
            <DialogDescription id="log-progress-description" className="sr-only">
              Update your reading progress for {book.title}
            </DialogDescription>
            <DialogDescription>
              {book.page_count 
                ? `You are on page ${currentPage} of ${book.page_count}.` 
                : `You are on page ${currentPage}. (Page count estimated at ${maxPages})`
              }
            </DialogDescription>
            {isCompleting && (
              <div className="flex items-center gap-2 p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg border border-yellow-200 dark:border-yellow-800">
                <Trophy className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
                <div className="text-sm">
                  <div className="font-medium text-yellow-800 dark:text-yellow-200">
                    🎉 Book Completion!
                  </div>
                  <div className="text-yellow-700 dark:text-yellow-300">
                    You'll earn {book.page_count || 0} AURA coins
                  </div>
                </div>
              </div>
            )}
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
                        max={maxPages}
                        step={1}
                        value={[field.value]}
                        onValueChange={(value) => field.onChange(value[0])}
                      />
                    </FormControl>
                    {!book.page_count && (
                      <p className="text-xs text-muted-foreground">
                        Page count not available - using estimated maximum of {maxPages} pages.
                      </p>
                    )}
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
                  {isCompleting ? "Complete Book! 🎉" : "Save Progress"}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Celebration Dialog */}
      <Dialog open={showCelebration} onOpenChange={setShowCelebration}>
        <DialogContent className="sm:max-w-[400px] text-center">
          <DialogHeader>
            <div className="mx-auto mb-4">
              <div className="relative">
                <Trophy className="h-16 w-16 text-yellow-500 mx-auto animate-bounce" />
                <div className="absolute -top-2 -right-2">
                  <Coins className="h-8 w-8 text-amber-500 animate-pulse" />
                </div>
              </div>
            </div>
            <DialogTitle className="text-2xl">🎉 Congratulations!</DialogTitle>
            <DialogDescription className="text-base space-y-3">
              <div>
                You've completed <strong>{book.title}</strong>!
              </div>
              <div className="flex items-center justify-center gap-2 p-4 bg-gradient-to-r from-amber-50 to-yellow-50 dark:from-amber-900/20 dark:to-yellow-900/20 rounded-lg border border-amber-200 dark:border-amber-800">
                <Coins className="h-6 w-6 text-amber-600 dark:text-amber-400" />
                <span className="text-xl font-bold text-amber-800 dark:text-amber-200">
                  +{rewardAmount} AURA
                </span>
              </div>
              <div className="text-sm text-muted-foreground">
                Your reward is being processed and will appear in your wallet soon!
              </div>
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="justify-center">
            <Button 
              onClick={() => setShowCelebration(false)}
              className="bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white"
            >
              Awesome! 🚀
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
