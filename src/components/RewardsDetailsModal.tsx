import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Clock, 
  CheckCircle, 
  AlertCircle, 
  Coins, 
  BookOpen, 
  TrendingUp,
  ExternalLink,
  Calendar,
  Trophy
} from "lucide-react";

interface PendingReward {
  id: string;
  book_title: string;
  book_pages: number;
  reward_amount: number;
  completed_at: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
}

interface CompletedReward {
  id: string;
  book_title: string;
  book_pages: number;
  reward_amount: number;
  completed_at: string;
  processed_at: string;
  transaction_hash?: string;
  status: 'completed';
}

interface RewardsDetailsModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RewardsDetailsModal({ isOpen, onOpenChange }: RewardsDetailsModalProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([]);
  const [completedRewards, setCompletedRewards] = useState<CompletedReward[]>([]);
  const [stats, setStats] = useState({
    totalEarned: 0,
    booksCompleted: 0,
    totalPending: 0,
    pendingAmount: 0,
  });

  // Load all rewards data
  const loadRewardsData = async () => {
    if (!user) return;
    
    setIsLoading(true);
    try {
      // Load pending rewards
      const { data: pendingData, error: pendingError } = await supabase
        .from('pending_rewards')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (pendingError) throw pendingError;
      
      const pending = pendingData || [];
      // Only show as "completed/earned" if there's an actual Stellar transaction
      const completed = pending.filter(r => r.transaction_hash != null) as CompletedReward[];
      const actuallyPending = pending.filter(r => r.transaction_hash == null) as PendingReward[];

      setPendingRewards(actuallyPending);
      setCompletedRewards(completed);

      // Calculate statistics - only count rewards with actual transactions as "earned"
      const totalEarned = completed.reduce((sum, r) => sum + r.reward_amount, 0);
      const pendingAmount = actuallyPending.reduce((sum, r) => sum + r.reward_amount, 0);
      
      setStats({
        totalEarned,
        booksCompleted: completed.length,
        totalPending: actuallyPending.length,
        pendingAmount,
      });

    } catch (error) {
      console.error('Error loading rewards:', error);
      toast({
        variant: "destructive",
        title: "Error loading rewards",
        description: "Could not fetch reward details.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription
  useEffect(() => {
    if (!user || !isOpen) return;

    loadRewardsData();

    const subscription = supabase
      .channel('rewards_details_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pending_rewards',
        filter: `user_id=eq.${user.id}`
      }, (payload) => {
        console.log('Reward updated:', payload);
        loadRewardsData();
        
        // Show notification for status changes
        if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
          toast({
            title: "🎉 Reward Processed!",
            description: `${payload.new.reward_amount} AURA sent to your wallet!`,
          });
        }
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user, isOpen]);

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    
    if (diffDays === 1) return 'Today';
    if (diffDays === 2) return 'Yesterday';
    if (diffDays <= 7) return `${diffDays - 1} days ago`;
    return date.toLocaleDateString();
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="w-4 h-4 text-amber-500" />;
      case 'processing': return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'failed': return <AlertCircle className="w-4 h-4 text-red-500" />;
      default: return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-amber-500/10 text-amber-700 border-amber-500/20';
      case 'processing': return 'bg-blue-500/10 text-blue-700 border-blue-500/20';
      case 'completed': return 'bg-green-500/10 text-green-700 border-green-500/20';
      case 'failed': return 'bg-red-500/10 text-red-700 border-red-500/20';
      default: return 'bg-gray-500/10 text-gray-700 border-gray-500/20';
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Trophy className="w-5 h-5" />
            Reward Details
          </DialogTitle>
          <DialogDescription>
            View your complete reward history and pending rewards
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="pending" className="flex-1 overflow-hidden">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Pending ({stats.totalPending})
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <CheckCircle className="w-4 h-4" />
              History ({stats.booksCompleted})
            </TabsTrigger>
            <TabsTrigger value="stats" className="flex items-center gap-2">
              <TrendingUp className="w-4 h-4" />
              Statistics
            </TabsTrigger>
          </TabsList>

          {/* Pending Rewards Tab */}
          <TabsContent value="pending" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  <div className="text-center space-y-1">
                    <div className="text-sm font-medium">Loading rewards...</div>
                    <div className="text-xs text-muted-foreground">Fetching your book completion history</div>
                  </div>
                </div>
              ) : pendingRewards.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Pending Rewards</h3>
                    <Badge variant="outline" className="text-amber-600">
                      {stats.pendingAmount} AURA pending
                    </Badge>
                  </div>
                  
                  {pendingRewards.map((reward) => (
                    <Card key={reward.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium truncate">
                              {reward.book_title}
                            </CardTitle>
                            <CardDescription className="flex items-center gap-2 mt-1 text-xs">
                              <BookOpen className="w-3 h-3 flex-shrink-0" />
                              <span className="truncate">{reward.book_pages} pages • Completed {formatDate(reward.completed_at)}</span>
                            </CardDescription>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:ml-4">
                            <Badge className={getStatusColor(reward.status)}>
                              {getStatusIcon(reward.status)}
                              <span className="ml-1 capitalize">{reward.status}</span>
                            </Badge>
                            <div className="text-right">
                              <div className="font-bold text-amber-600 text-sm sm:text-base">
                                {reward.reward_amount} AURA
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Coins className="w-12 h-12 mb-4" />
                  <p>No pending rewards</p>
                  <p className="text-sm">Complete books to earn AURA tokens!</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* History Tab */}
          <TabsContent value="history" className="flex-1 overflow-hidden">
            <ScrollArea className="h-[500px] pr-4">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-primary border-t-transparent"></div>
                  <div className="text-center space-y-1">
                    <div className="text-sm font-medium">Loading history...</div>
                    <div className="text-xs text-muted-foreground">Checking for completed transactions</div>
                  </div>
                </div>
              ) : completedRewards.length > 0 ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold">Completed Rewards</h3>
                    <Badge variant="outline" className="text-green-600">
                      {stats.totalEarned} AURA earned
                    </Badge>
                  </div>
                  
                  {completedRewards.map((reward) => (
                    <Card key={reward.id} className="hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium truncate">
                              {reward.book_title}
                            </CardTitle>
                            <CardDescription className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{reward.book_pages} pages • Completed {formatDate(reward.completed_at)}</span>
                              </div>
                              {reward.processed_at && (
                                <div className="flex items-center gap-2">
                                  <CheckCircle className="w-3 h-3 text-green-500 flex-shrink-0" />
                                  <span className="truncate">Processed {formatDate(reward.processed_at)}</span>
                                </div>
                              )}
                              {reward.transaction_hash && (
                                <div className="flex items-center gap-2">
                                  <ExternalLink className="w-3 h-3 flex-shrink-0" />
                                  <a
                                    href={`https://stellar.expert/explorer/testnet/tx/${reward.transaction_hash}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-500 hover:underline text-sm truncate max-w-[150px] sm:max-w-[200px]"
                                  >
                                    View transaction
                                  </a>
                                </div>
                              )}
                            </CardDescription>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:ml-4">
                            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Completed
                            </Badge>
                            <div className="text-right">
                              <div className="font-bold text-green-600 text-sm sm:text-base">
                                +{reward.reward_amount} AURA
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                  <Trophy className="w-12 h-12 mb-4" />
                  <p>No completed rewards yet</p>
                  <p className="text-sm">Complete and process rewards to see history</p>
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          {/* Statistics Tab */}
          <TabsContent value="stats" className="flex-1 overflow-hidden">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-2">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Total AURA Earned</CardTitle>
                  <Coins className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">{stats.totalEarned}</div>
                  <p className="text-xs text-muted-foreground">
                    From {stats.booksCompleted} completed books
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Pending AURA</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-amber-600">{stats.pendingAmount}</div>
                  <p className="text-xs text-muted-foreground">
                    From {stats.totalPending} books awaiting processing
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Books Completed</CardTitle>
                  <BookOpen className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.booksCompleted}</div>
                  <p className="text-xs text-muted-foreground">
                    With rewards processed
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">Average per Book</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">
                    {stats.booksCompleted > 0 
                      ? Math.round(stats.totalEarned / stats.booksCompleted) 
                      : 0
                    }
                  </div>
                  <p className="text-xs text-muted-foreground">
                    AURA per completed book
                  </p>
                </CardContent>
              </Card>
            </div>

            {(stats.totalEarned > 0 || stats.totalPending > 0) && (
              <div className="mt-6 p-4 bg-muted/50 rounded-lg">
                <h4 className="font-medium mb-2 flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  Reading Progress
                </h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Total books completed with rewards:</span>
                    <span className="font-medium">{stats.booksCompleted + stats.totalPending}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total AURA value (earned + pending):</span>
                    <span className="font-medium">{stats.totalEarned + stats.pendingAmount}</span>
                  </div>
                  <Separator className="my-2" />
                  <div className="flex justify-between text-muted-foreground">
                    <span>At 1 AURA per page read:</span>
                    <span>{stats.totalEarned + stats.pendingAmount} pages completed</span>
                  </div>
                </div>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
} 