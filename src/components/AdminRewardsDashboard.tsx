import * as React from "react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useFreighter } from "@/contexts/FreighterContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { 
  Shield, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  Filter,
  Search,
  BookOpen,
  Coins,
  Eye,
  EyeOff,
  RefreshCw,
  Settings
} from "lucide-react";
import { AURACOIN_CONFIG } from "@/utils/auraCoinUtils";

interface AdminPendingReward {
  id: string;
  user_id: string;
  book_title: string;
  book_pages: number;
  reward_amount: number;
  completed_at: string;
  created_at: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  wallet_address: string;
}

interface AdminStats {
  totalPendingRewards: number;
  totalPendingAmount: number;
  totalUsers: number;
  totalProcessedRewards: number;
  totalProcessedAmount: number;
}

export const AdminRewardsDashboard = () => {
  const { user } = useAuth();
  const { walletAddress } = useFreighter();
  const { toast } = useToast();
  
  const [isLoading, setIsLoading] = useState(true);
  const [pendingRewards, setPendingRewards] = useState<AdminPendingReward[]>([]);
  const [processedRewards, setProcessedRewards] = useState<AdminPendingReward[]>([]);
  const [stats, setStats] = useState<AdminStats>({
    totalPendingRewards: 0,
    totalPendingAmount: 0,
    totalUsers: 0,
    totalProcessedRewards: 0,
    totalProcessedAmount: 0,
  });
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [sortBy, setSortBy] = useState<string>("newest");
  const [selectedRewards, setSelectedRewards] = useState<string[]>([]);

  // Check if current user is the contract owner
  const isContractOwner = walletAddress === AURACOIN_CONFIG.OWNER_ADDRESS;

  // Load all rewards data (admin view)
  const loadAdminRewardsData = async () => {
    if (!isContractOwner) return;
    
    setIsLoading(true);
    try {
      // Get all pending rewards
      const { data: allRewards, error } = await supabase
        .from('pending_rewards')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Split into pending and processed
      const pending = (allRewards || []).filter(r => !r.transaction_hash) as AdminPendingReward[];
      const processed = (allRewards || []).filter(r => r.transaction_hash) as AdminPendingReward[];
      
      setPendingRewards(pending);
      setProcessedRewards(processed);

      // Calculate stats
      const uniqueUsers = new Set((allRewards || []).map(r => r.user_id)).size;
      const totalPendingAmount = pending.reduce((sum, r) => sum + r.reward_amount, 0);
      const totalProcessedAmount = processed.reduce((sum, r) => sum + r.reward_amount, 0);

      setStats({
        totalPendingRewards: pending.length,
        totalPendingAmount,
        totalUsers: uniqueUsers,
        totalProcessedRewards: processed.length,
        totalProcessedAmount,
      });

    } catch (error) {
      console.error('Error loading admin rewards data:', error);
      toast({
        variant: "destructive",
        title: "Error Loading Admin Data",
        description: "Failed to load rewards data. Please try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Set up real-time subscription for admin view
  useEffect(() => {
    if (!isContractOwner) return;

    loadAdminRewardsData();

    const subscription = supabase
      .channel('admin_rewards_changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'pending_rewards'
      }, (payload) => {
        console.log('Admin: Reward updated:', payload);
        loadAdminRewardsData(); // Refresh admin view
      })
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [isContractOwner]);

  // Filter and sort rewards
  const getFilteredRewards = (rewards: AdminPendingReward[]) => {
    let filtered = rewards;

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(reward =>
        reward.book_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.user_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reward.wallet_address.includes(searchTerm)
      );
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter(reward => reward.status === statusFilter);
    }

    // Sort
    switch (sortBy) {
      case "newest":
        filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        break;
      case "oldest":
        filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime());
        break;
      case "highest":
        filtered.sort((a, b) => b.reward_amount - a.reward_amount);
        break;
      case "lowest":
        filtered.sort((a, b) => a.reward_amount - b.reward_amount);
        break;
      case "user":
        filtered.sort((a, b) => a.user_id.localeCompare(b.user_id));
        break;
    }

    return filtered;
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const toggleRewardSelection = (rewardId: string) => {
    setSelectedRewards(prev =>
      prev.includes(rewardId)
        ? prev.filter(id => id !== rewardId)
        : [...prev, rewardId]
    );
  };

  const selectAllVisible = (rewards: AdminPendingReward[]) => {
    const visibleIds = rewards.map(r => r.id);
    setSelectedRewards(visibleIds);
  };

  const clearSelection = () => {
    setSelectedRewards([]);
  };

  // Don't render anything if not contract owner
  if (!isContractOwner) {
    return null;
  }

  return (
    <Card className="bg-black/60 backdrop-blur-md border-amber-500/30 text-stone-300 shadow-xl shadow-amber-500/10">
      <CardHeader>
        <CardTitle className="text-amber-200 font-pixel tracking-wider flex items-center gap-2">
          <Shield className="w-5 h-5" />
          Admin Rewards Dashboard
          <Badge variant="secondary" className="ml-auto bg-amber-500/20 text-amber-200">
            Owner Only
          </Badge>
        </CardTitle>
        <CardDescription className="text-amber-400/70">
          Manage all user rewards and process AURA token distribution
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Admin Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Clock className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-medium text-amber-400">Pending</span>
            </div>
            <div className="text-lg font-bold text-amber-300">{stats.totalPendingRewards}</div>
            <div className="text-xs text-amber-400/70">{stats.totalPendingAmount} AURA</div>
          </div>

          <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <CheckCircle className="w-4 h-4 text-green-400" />
              <span className="text-xs font-medium text-green-400">Processed</span>
            </div>
            <div className="text-lg font-bold text-green-300">{stats.totalProcessedRewards}</div>
            <div className="text-xs text-green-400/70">{stats.totalProcessedAmount} AURA</div>
          </div>

          <div className="p-3 bg-purple-500/10 border border-purple-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Users className="w-4 h-4 text-purple-400" />
              <span className="text-xs font-medium text-purple-400">Users</span>
            </div>
            <div className="text-lg font-bold text-purple-300">{stats.totalUsers}</div>
            <div className="text-xs text-purple-400/70">with rewards</div>
          </div>

          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 mb-1">
              <Coins className="w-4 h-4 text-blue-400" />
              <span className="text-xs font-medium text-blue-400">Total Value</span>
            </div>
            <div className="text-lg font-bold text-blue-300">{stats.totalPendingAmount + stats.totalProcessedAmount}</div>
            <div className="text-xs text-blue-400/70">AURA total</div>
          </div>
        </div>

        <Separator className="bg-amber-500/20" />

        {/* Filters and Controls */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-amber-200">Rewards Management</h3>
            <Button
              onClick={loadAdminRewardsData}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-amber-500/30 text-amber-300 hover:bg-amber-500/10"
            >
              <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label className="text-amber-300 text-xs">Search</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-stone-400" />
                <Input
                  placeholder="Book title, user ID, or wallet..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10 bg-stone-800/50 border-stone-600 text-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label className="text-amber-300 text-xs">Status</Label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="bg-stone-800/50 border-stone-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="processing">Processing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="failed">Failed</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-amber-300 text-xs">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="bg-stone-800/50 border-stone-600 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="highest">Highest Amount</SelectItem>
                  <SelectItem value="lowest">Lowest Amount</SelectItem>
                  <SelectItem value="user">By User</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label className="text-amber-300 text-xs">Actions</Label>
              <div className="flex gap-2">
                <Button
                  onClick={() => selectAllVisible(getFilteredRewards(pendingRewards))}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-stone-600 text-stone-300 hover:bg-stone-700/50"
                >
                  <Eye className="w-3 h-3 mr-1" />
                  All
                </Button>
                <Button
                  onClick={clearSelection}
                  variant="outline"
                  size="sm"
                  className="flex-1 border-stone-600 text-stone-300 hover:bg-stone-700/50"
                >
                  <EyeOff className="w-3 h-3 mr-1" />
                  None
                </Button>
              </div>
            </div>
          </div>

          {selectedRewards.length > 0 && (
            <div className="flex items-center justify-between p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
              <span className="text-sm text-amber-200">
                {selectedRewards.length} reward{selectedRewards.length !== 1 ? 's' : ''} selected
              </span>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="border-amber-500/30 text-amber-300 hover:bg-amber-500/20"
                  disabled // Will be enabled in Phase C.2
                >
                  <Settings className="w-4 h-4 mr-1" />
                  Process Selected
                </Button>
              </div>
            </div>
          )}
        </div>

        {/* Rewards Tabs */}
        <Tabs defaultValue="pending" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-stone-800/50">
            <TabsTrigger value="pending" className="data-[state=active]:bg-amber-500/20">
              Pending ({stats.totalPendingRewards})
            </TabsTrigger>
            <TabsTrigger value="processed" className="data-[state=active]:bg-green-500/20">
              Processed ({stats.totalProcessedRewards})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-amber-400 border-t-transparent"></div>
                  <div className="text-center space-y-1">
                    <div className="text-sm font-medium">Loading pending rewards...</div>
                    <div className="text-xs text-muted-foreground">Fetching data from all users</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredRewards(pendingRewards).map((reward) => (
                    <Card 
                      key={reward.id} 
                      className={`hover:shadow-md transition-all cursor-pointer ${
                        selectedRewards.includes(reward.id) 
                          ? 'bg-amber-500/10 border-amber-500/30' 
                          : 'bg-stone-800/30 border-stone-700'
                      }`}
                      onClick={() => toggleRewardSelection(reward.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium truncate text-white">
                              {reward.book_title}
                            </CardTitle>
                            <CardDescription className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{reward.book_pages} pages • {formatDate(reward.completed_at)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-amber-400">
                                <Users className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate font-mono text-xs">User: {reward.user_id.slice(0, 8)}...</span>
                              </div>
                              <div className="flex items-center gap-2 text-stone-400">
                                <span className="text-xs font-mono truncate">{reward.wallet_address.slice(0, 12)}...{reward.wallet_address.slice(-8)}</span>
                              </div>
                            </CardDescription>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:ml-4">
                            <Badge className="bg-amber-500/10 text-amber-700 border-amber-500/20 text-xs">
                              <Clock className="w-3 h-3 mr-1" />
                              Pending
                            </Badge>
                            <div className="text-right">
                              <div className="font-bold text-amber-400 text-sm sm:text-base">
                                {reward.reward_amount} AURA
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  
                  {getFilteredRewards(pendingRewards).length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <Clock className="w-12 h-12 mb-4" />
                      <p>No pending rewards found</p>
                      <p className="text-sm">All rewards have been processed or filters exclude results</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>

          <TabsContent value="processed" className="space-y-4">
            <ScrollArea className="h-[400px]">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-40 space-y-3">
                  <div className="animate-spin rounded-full h-8 w-8 border-2 border-green-400 border-t-transparent"></div>
                  <div className="text-center space-y-1">
                    <div className="text-sm font-medium">Loading processed rewards...</div>
                    <div className="text-xs text-muted-foreground">Fetching transaction history</div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {getFilteredRewards(processedRewards).map((reward) => (
                    <Card key={reward.id} className="bg-stone-800/30 border-stone-700 hover:shadow-md transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                          <div className="flex-1 min-w-0">
                            <CardTitle className="text-base font-medium truncate text-white">
                              {reward.book_title}
                            </CardTitle>
                            <CardDescription className="space-y-1 text-xs">
                              <div className="flex items-center gap-2">
                                <BookOpen className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate">{reward.book_pages} pages • {formatDate(reward.completed_at)}</span>
                              </div>
                              <div className="flex items-center gap-2 text-green-400">
                                <Users className="w-3 h-3 flex-shrink-0" />
                                <span className="truncate font-mono text-xs">User: {reward.user_id.slice(0, 8)}...</span>
                              </div>
                            </CardDescription>
                          </div>
                          <div className="flex items-center justify-between sm:justify-end gap-2 sm:ml-4">
                            <Badge className="bg-green-500/10 text-green-700 border-green-500/20 text-xs">
                              <CheckCircle className="w-3 h-3 mr-1" />
                              Processed
                            </Badge>
                            <div className="text-right">
                              <div className="font-bold text-green-400 text-sm sm:text-base">
                                +{reward.reward_amount} AURA
                              </div>
                            </div>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                  
                  {getFilteredRewards(processedRewards).length === 0 && (
                    <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                      <CheckCircle className="w-12 h-12 mb-4" />
                      <p>No processed rewards found</p>
                      <p className="text-sm">No rewards have been processed yet or filters exclude results</p>
                    </div>
                  )}
                </div>
              )}
            </ScrollArea>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}; 