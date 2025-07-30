import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFreighter } from '@/contexts/FreighterContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  getBalance, 
  getTokenInfo, 
  formatBalance,
  getContractExplorerUrl,
  AURACOIN_CONFIG 
} from '@/utils/auraCoinUtils';
import { RewardsDetailsModal } from '@/components/RewardsDetailsModal';
import { 
  Coins, 
  ExternalLink, 
  RefreshCw, 
  Loader2,
  BookOpen,
  Clock,
  Eye
} from 'lucide-react';

interface PendingReward {
  id: string
  book_title: string
  reward_amount: number
  book_pages: number
  completed_at: string
  status: 'pending' | 'processing' | 'completed' | 'failed'
}

export const UserAuraCoinBalance = () => {
  const { user } = useAuth();
  const { isWalletConnected, walletAddress, connectWallet } = useFreighter();
  
  const [balance, setBalance] = useState<string>('0');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [pendingRewards, setPendingRewards] = useState<PendingReward[]>([]);
  const [totalCompletedRewards, setTotalCompletedRewards] = useState(0);
  const [showRewardsModal, setShowRewardsModal] = useState(false);

  // Load token info and balance
  const loadData = async () => {
    if (!isWalletConnected || !walletAddress) return;
    
    setLoading(true);
    try {
      const [balanceData, tokenInfoData] = await Promise.all([
        getBalance(walletAddress),
        getTokenInfo()
      ]);
      
      setBalance(balanceData);
      setTokenInfo(tokenInfoData);
    } catch (error) {
      console.error('Error loading AuraCoin data:', error);
      toast({
        title: "Error",
        description: "Failed to load AuraCoin data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Load pending rewards from database  
  const loadPendingRewards = async () => {
    if (!user) return;
    
    try {
      // Get all rewards for this user
      const { data, error } = await supabase
        .from('pending_rewards')
        .select('id, book_title, reward_amount, book_pages, completed_at, status, transaction_hash')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      const allRewards = data || [];
      
      // Split into pending (no transaction) and completed (with transaction)
      const pendingRewards = allRewards.filter(r => !r.transaction_hash);
      const completedRewards = allRewards.filter(r => r.transaction_hash);
      
      // Cast status to the expected type since database returns string | null
      const typedPendingRewards = pendingRewards.map(reward => ({
        ...reward,
        status: (reward.status || 'pending') as 'pending' | 'processing' | 'completed' | 'failed'
      }));
      
      setPendingRewards(typedPendingRewards);
      
      // Calculate total completed rewards (only those with actual transactions)
      const totalCompleted = completedRewards.reduce((sum, r) => sum + r.reward_amount, 0);
      setTotalCompletedRewards(totalCompleted);
      
    } catch (error) {
      console.error('Error loading pending rewards:', error);
      setPendingRewards([]);
      setTotalCompletedRewards(0);
    }
  };

  // Calculate total pending amount
  const totalPendingAmount = pendingRewards.reduce((sum, reward) => sum + reward.reward_amount, 0);

  // Set up real-time subscription for pending rewards
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('user_pending_rewards_changes')
      .on('postgres_changes', 
        { 
          event: '*', 
          schema: 'public', 
          table: 'pending_rewards',
          filter: `user_id=eq.${user.id}`
        },
        (payload) => {
          console.log('Pending reward updated:', payload);
          loadPendingRewards(); // Refresh pending rewards when they change
          
          // Show toast for status changes
          if (payload.eventType === 'UPDATE' && payload.new.status === 'completed') {
            toast({
              title: "🎉 Reward Processed!",
              description: `${payload.new.reward_amount} AURA for "${payload.new.book_title}" has been processed!`,
              duration: 5000,
            });
          }
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [user]);

  // Load wallet connection and balance (run once on mount)
  useEffect(() => {
    const loadWalletConnection = async () => {
      try {
        await connectWallet();
        console.log('Wallet connection check completed');
      } catch (error) {
        console.warn('Failed to auto-connect wallet:', error);
      }
    };
    
    loadWalletConnection();
  }, []); // Remove connectWallet dependency to prevent infinite loop

  // Load data when wallet connects
  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      loadData();
    }
  }, [isWalletConnected, walletAddress]);

  // Load pending rewards when user changes
  useEffect(() => {
    if (user) {
      loadPendingRewards();
    }
  }, [user]);

  if (!isWalletConnected) {
    return (
      <Card className="relative group">
        {/* Premium glass morphism background */}
        <div className="absolute inset-0 bg-gradient-to-br from-amber-900/15 via-purple-900/20 to-amber-900/15 backdrop-blur-xl border border-amber-700/40 rounded-lg shadow-2xl shadow-amber-900/25" />
        <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded-lg" />
        
        {/* Glow effect */}
        <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-purple-700 to-amber-700 rounded-lg opacity-15 blur-sm group-hover:opacity-25 transition-opacity duration-500" />
        
        <div className="relative">
          <CardHeader className="pb-4">
            <CardTitle className="text-white/90 font-pixel tracking-wider flex items-center gap-3 text-lg">
              <div className="relative">
                <Coins className="w-6 h-6 text-amber-600 drop-shadow-lg" />
                <div className="absolute inset-0 bg-amber-600/30 blur-md rounded-full" />
              </div>
              AuraCoin Balance
            </CardTitle>
            <CardDescription className="text-stone-300/80 font-playfair">
              Connect your wallet to unlock your reading rewards and track AuraCoin earnings
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-2">
            <div className="relative p-5 bg-gradient-to-r from-blue-900/20 via-indigo-900/15 to-blue-900/20 border border-blue-700/40 rounded-xl backdrop-blur-sm">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-700/40 to-indigo-700/40 flex items-center justify-center border border-blue-600/30">
                  <Coins className="w-6 h-6 text-blue-500" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-blue-400 mb-1">Wallet Connection Required</div>
                  <div className="text-sm text-blue-300/80">Connect your Freighter wallet to access AuraCoin features and view your reading rewards</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 bg-purple-900/20 border border-purple-700/30 rounded-lg">
                <div className="w-2 h-2 bg-purple-500 rounded-full" />
                <span className="text-purple-300">View AURA token balance</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-amber-900/20 border border-amber-700/30 rounded-lg">
                <div className="w-2 h-2 bg-amber-500 rounded-full" />
                <span className="text-amber-300">See pending book rewards</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-green-900/20 border border-green-700/30 rounded-lg">
                <div className="w-2 h-2 bg-green-500 rounded-full" />
                <span className="text-green-300">Track reading achievements</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative group">
      {/* Premium glass morphism background */}
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/12 via-yellow-900/15 to-orange-900/12 backdrop-blur-xl border border-amber-700/40 rounded-lg shadow-2xl shadow-amber-900/20" />
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 via-transparent to-black/20 rounded-lg" />
      
      {/* AURA glow */}
      <div className="absolute inset-0 bg-gradient-to-r from-amber-700 via-yellow-700 to-amber-700 rounded-lg opacity-15 blur-sm group-hover:opacity-25 transition-opacity duration-500" />
      
      <div className="relative">
        <CardHeader className="pb-4">
          <CardTitle className="text-white/90 font-pixel tracking-wider flex items-center gap-3 text-lg">
            <div className="relative">
              <Coins className="w-6 h-6 text-amber-600 drop-shadow-lg" />
              <div className="absolute inset-0 bg-amber-600/30 blur-md rounded-full" />
            </div>
            AuraCoin Balance
            <Badge className="ml-auto bg-gradient-to-r from-amber-800/40 to-yellow-800/40 border-amber-600/40 text-amber-400 hover:bg-amber-700/50 transition-colors duration-300">
              {AURACOIN_CONFIG.NETWORK}
            </Badge>
          </CardTitle>
          <CardDescription className="text-stone-300/80 font-playfair">
            Your AURA tokens earned from reading books and completing literary journeys
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-2">
          {/* Hero Balance Display */}
          <div className="relative">
            {/* Background glow for balance */}
            <div className="absolute inset-0 bg-gradient-to-r from-amber-800/20 via-yellow-800/25 to-amber-800/20 rounded-2xl blur-xl" />
            
            <div className="relative text-center p-4 sm:p-6 lg:p-8 bg-gradient-to-br from-amber-900/15 via-yellow-900/20 to-orange-900/15 border border-amber-700/30 rounded-2xl backdrop-blur-sm">
              <div className="mb-3">
                <div className="text-xs sm:text-sm font-medium text-amber-400/80 uppercase tracking-wider mb-3 sm:mb-2">
                  {loading ? "Checking wallet..." : "Available Balance"}
                </div>
                
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-amber-400 via-yellow-400 to-amber-500 bg-clip-text text-transparent tracking-tight">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-gradient-to-r from-amber-700/30 to-yellow-700/30 flex items-center justify-center border border-amber-600/30">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-amber-500" />
                      </div>
                      <span className="text-base sm:text-lg text-amber-500/80">Loading balance...</span>
                    </div>
                  ) : balance !== '0' ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                      <span className="animate-in fade-in duration-700 leading-none">{formatBalance(balance)}</span>
                      <span className="text-xl sm:text-2xl md:text-3xl text-amber-500/80 leading-none">AURA</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <span className="text-stone-400 leading-none">0 AURA</span>
                      <div className="text-xs sm:text-sm text-amber-600/80 font-normal bg-amber-900/20 px-3 sm:px-4 py-2 rounded-full border border-amber-700/30 max-w-full">
                        Complete books to earn your first tokens!
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Balance decoration */}
              <div className="flex justify-center items-center gap-2 mt-4">
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
                <div className="text-xs text-amber-500/80 font-medium">Live Balance</div>
                <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse" />
              </div>
            </div>
          </div>

          {/* Enhanced Book Rewards Summary */}
          {user && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-white/90 flex items-center gap-3 font-pixel tracking-wide">
                  <div className="relative">
                    <BookOpen className="w-6 h-6 text-amber-600 drop-shadow-lg" />
                    <div className="absolute inset-0 bg-amber-600/30 blur-md rounded-full" />
                  </div>
                  Reading Rewards
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRewardsModal(true)}
                  className="bg-gradient-to-r from-amber-800/20 to-yellow-800/20 border-amber-600/40 text-amber-400 hover:bg-amber-700/30 hover:border-amber-500/60 hover:scale-105 active:scale-100 transition-all duration-200 h-10 sm:h-11 px-3 sm:px-4 touch-manipulation"
                  aria-label="View detailed breakdown of your reading rewards"
                >
                  <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                  <span className="text-xs sm:text-sm font-medium">
                    <span className="hidden sm:inline">View Details</span>
                    <span className="sm:hidden">Details</span>
                  </span>
                </Button>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                {/* Pending Rewards Card */}
                <div className="relative group/pending touch-manipulation">
                  <div className="absolute inset-0 bg-gradient-to-r from-orange-800/15 via-amber-800/20 to-yellow-800/15 rounded-xl blur-sm opacity-50 group-hover/pending:opacity-75 group-active/pending:opacity-75 transition-opacity duration-300" />
                  
                  <div className="relative p-4 sm:p-5 bg-gradient-to-br from-orange-900/20 via-amber-900/15 to-yellow-900/20 border border-amber-700/40 rounded-xl backdrop-blur-sm hover:border-amber-600/50 active:border-amber-600/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Clock className="w-5 h-5 text-amber-500 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-amber-500/30 blur-md rounded-full" />
                      </div>
                      <span className="text-base font-semibold text-amber-400">Pending Rewards</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-amber-300">
                        {pendingRewards.length}
                      </div>
                      <div className="text-sm text-amber-500/80">
                        {totalPendingAmount} AURA waiting
                      </div>
                      <div className="w-full bg-amber-900/30 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-amber-600 to-yellow-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((pendingRewards.length / 10) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Earned Rewards Card */}
                <div className="relative group/earned touch-manipulation">
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-800/15 via-green-800/20 to-teal-800/15 rounded-xl blur-sm opacity-50 group-hover/earned:opacity-75 group-active/earned:opacity-75 transition-opacity duration-300" />
                  
                  <div className="relative p-4 sm:p-5 bg-gradient-to-br from-emerald-900/20 via-green-900/15 to-teal-900/20 border border-green-700/40 rounded-xl backdrop-blur-sm hover:border-green-600/50 active:border-green-600/50 transition-all duration-300">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Coins className="w-5 h-5 text-green-500 drop-shadow-lg" />
                        <div className="absolute inset-0 bg-green-500/30 blur-md rounded-full" />
                      </div>
                      <span className="text-base font-semibold text-green-400">Total Earned</span>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="text-2xl font-bold text-green-300">
                        {totalCompletedRewards}
                      </div>
                      <div className="text-sm text-green-500/80">
                        AURA from reading
                      </div>
                      <div className="w-full bg-green-900/30 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-green-600 to-emerald-500 h-2 rounded-full transition-all duration-500"
                          style={{ width: `${Math.min((totalCompletedRewards / 100) * 100, 100)}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            
              {/* Enhanced Empty State */}
              {pendingRewards.length === 0 && totalCompletedRewards === 0 && (
                <div className="relative p-6 bg-gradient-to-br from-slate-800/20 via-stone-800/30 to-slate-800/20 border border-stone-600/40 rounded-xl backdrop-blur-sm text-center">
                  <div className="absolute inset-0 bg-gradient-to-r from-stone-600/10 via-slate-500/5 to-stone-600/10 rounded-xl blur-sm opacity-50" />
                  
                  <div className="relative">
                    <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-amber-800/30 to-yellow-800/30 rounded-full flex items-center justify-center border border-amber-700/40">
                      <BookOpen className="w-8 h-8 text-amber-500" />
                    </div>
                    <h4 className="text-lg font-semibold text-stone-200 mb-2">Start Your Reading Journey</h4>
                    <p className="text-stone-400 text-sm mb-3">
                      Complete books to start earning AURA tokens!
                    </p>
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-900/20 border border-amber-700/30 rounded-full text-xs text-amber-400">
                      <Coins className="w-3 h-3" />
                      <span>1 AURA per page read</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Pending Rewards Notice */}
              {pendingRewards.length > 0 && (
                <div className="relative p-5 bg-gradient-to-br from-amber-900/15 via-orange-900/20 to-yellow-900/15 border border-amber-700/40 rounded-xl backdrop-blur-sm">
                  <div className="absolute inset-0 bg-gradient-to-r from-amber-800/15 via-orange-800/10 to-amber-800/15 rounded-xl blur-sm opacity-50" />
                  
                  <div className="relative">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="relative">
                        <Clock className="w-5 h-5 text-amber-500 drop-shadow-lg animate-pulse" />
                        <div className="absolute inset-0 bg-amber-500/30 blur-md rounded-full" />
                      </div>
                      <h4 className="text-base font-semibold text-amber-300">Processing Rewards</h4>
                    </div>
                    
                    <p className="text-amber-200/90 text-sm mb-2">
                      You have <span className="font-bold text-amber-300">{pendingRewards.length}</span> pending reward{pendingRewards.length !== 1 ? 's' : ''} totaling <span className="font-bold text-amber-300">{totalPendingAmount} AURA</span>
                    </p>
                    <p className="text-amber-400/70 text-xs">
                      Rewards are processed by the admin and will be added to your balance soon
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Enhanced Token Info */}
          {tokenInfo && (
            <div className="relative p-5 bg-gradient-to-br from-indigo-900/15 via-purple-900/20 to-blue-900/15 border border-indigo-700/40 rounded-xl backdrop-blur-sm">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-800/10 via-purple-800/15 to-blue-800/10 rounded-xl blur-sm opacity-50" />
              
              <div className="relative">
                <h4 className="text-sm font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  Token Information
                </h4>
                
                <div className="space-y-3 text-sm">
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Token Name:</span>
                    <span className="text-indigo-300 font-medium">{tokenInfo.name}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Symbol:</span>
                    <span className="text-indigo-300 font-medium">{tokenInfo.symbol}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-stone-400">Total Supply:</span>
                    <span className="text-indigo-300 font-medium font-mono">{formatBalance(tokenInfo.totalSupply)}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Enhanced Contract Info */}
          <div className="relative p-4 bg-gradient-to-br from-slate-800/20 via-stone-800/25 to-slate-800/20 border border-stone-600/40 rounded-xl backdrop-blur-sm">
            <div className="absolute inset-0 bg-gradient-to-r from-stone-600/10 via-slate-500/8 to-stone-600/10 rounded-xl blur-sm opacity-50" />
            
            <div className="relative flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-stone-600/40 to-slate-600/40 flex items-center justify-center border border-stone-500/30">
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-300">Smart Contract</div>
                  <div className="text-xs text-stone-500 font-mono">
                    {AURACOIN_CONFIG.CONTRACT_ID.slice(0, 12)}...{AURACOIN_CONFIG.CONTRACT_ID.slice(-8)}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(getContractExplorerUrl(), '_blank')}
                className="text-stone-400 hover:text-stone-200 hover:bg-stone-700/30 hover:scale-105 transition-all duration-200 h-9 px-3"
              >
                <ExternalLink className="w-4 h-4 mr-1.5" />
                <span className="text-xs font-medium">Explorer</span>
              </Button>
            </div>
          </div>

          {/* Enhanced Refresh Button with Mobile Optimization */}
          <Button
            onClick={() => {
              loadData();
              loadPendingRewards();
            }}
            disabled={loading}
            variant="outline"
            size="lg"
            className="w-full h-12 sm:h-14 bg-gradient-to-r from-amber-800/20 to-yellow-800/20 border-amber-600/40 text-amber-400 hover:bg-amber-700/30 hover:border-amber-500/60 hover:scale-[1.02] active:scale-[1.005] transition-all duration-300 relative overflow-hidden group/refresh touch-manipulation"
            aria-label="Refresh AuraCoin balance and pending rewards"
          >
            {/* Button shine effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent transform -skew-x-12 -translate-x-full group-hover/refresh:translate-x-full transition-transform duration-700" />
            
            <div className="relative flex items-center justify-center gap-2 sm:gap-3">
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : 'group-hover/refresh:rotate-180'} transition-transform duration-300`} />
              <span className="font-medium text-sm sm:text-base">
                <span className="hidden sm:inline">
                  {loading ? 'Refreshing...' : 'Refresh Balance & Rewards'}
                </span>
                <span className="sm:hidden">
                  {loading ? 'Refreshing...' : 'Refresh'}
                </span>
              </span>
            </div>
          </Button>
        </CardContent>
      </div>
      
      {/* Rewards Details Modal */}
      <RewardsDetailsModal 
        isOpen={showRewardsModal} 
        onOpenChange={setShowRewardsModal} 
      />
    </Card>
  );
};