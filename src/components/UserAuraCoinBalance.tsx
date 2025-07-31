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
        {/* Minimal dark background - refined */}
        <div className="absolute inset-0 bg-black/40 backdrop-blur-sm border border-stone-600/10 rounded-lg" />
        
        <div className="relative">
          <CardHeader className="pb-4">
            <CardTitle className="text-amber-400 font-pixel tracking-[0.12em] flex items-center gap-3 text-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
              <Coins className="w-6 h-6 text-amber-400" />
              AuraCoin Balance
            </CardTitle>
            <CardDescription className="text-stone-300 font-playfair tracking-wide">
              Connect your wallet to unlock your reading rewards and track AuraCoin earnings
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-6 pt-2">
            <div className="p-5 bg-black/20 border border-stone-600/15 rounded-xl">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-black/40 flex items-center justify-center border border-stone-600/20">
                  <Coins className="w-6 h-6 text-amber-400" />
                </div>
                <div className="flex-1">
                  <div className="text-base font-semibold text-amber-400 mb-1 tracking-wide">Wallet Connection Required</div>
                  <div className="text-sm text-stone-400 tracking-wide">Connect your Freighter wallet to access AuraCoin features and view your reading rewards</div>
                </div>
              </div>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-sm">
              <div className="flex items-center gap-2 p-3 bg-black/20 border border-stone-600/15 rounded-lg">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-stone-300 tracking-wide">View AURA token balance</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-black/20 border border-stone-600/15 rounded-lg">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-stone-300 tracking-wide">See pending book rewards</span>
              </div>
              <div className="flex items-center gap-2 p-3 bg-black/20 border border-stone-600/15 rounded-lg">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <span className="text-stone-300 tracking-wide">Track reading achievements</span>
              </div>
            </div>
          </CardContent>
        </div>
      </Card>
    );
  }

  return (
    <Card className="relative group">
      {/* Minimal dark background - refined */}
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm border border-stone-600/10 rounded-lg" />
      
      <div className="relative">
        <CardHeader className="pb-4">
          <CardTitle className="text-amber-400 font-pixel tracking-[0.12em] flex items-center gap-3 text-lg [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
            <Coins className="w-6 h-6 text-amber-400" />
            AuraCoin Balance
            <Badge className="ml-auto bg-black/40 border-stone-600/20 text-stone-300">
              {AURACOIN_CONFIG.NETWORK}
            </Badge>
          </CardTitle>
          <CardDescription className="text-stone-300 font-playfair tracking-wide">
            Your AURA tokens earned from reading books and completing literary journeys
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-8 pt-2">
          {/* Hero Balance Display */}
          <div className="text-center p-4 sm:p-6 lg:p-8 bg-black/20 border border-stone-600/15 rounded-2xl">
              <div className="mb-3">
                <div className="text-xs sm:text-sm font-medium text-stone-400 uppercase tracking-[0.2em] mb-3 sm:mb-2">
                  {loading ? "Checking wallet..." : "Available Balance"}
                </div>
                
                <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold text-amber-400 [text-shadow:0_2px_4px_rgba(0,0,0,0.8)] tracking-tight">
                  {loading ? (
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <div className="w-12 h-12 sm:w-16 sm:h-16 rounded-full bg-black/40 flex items-center justify-center border border-stone-600/20">
                        <Loader2 className="w-6 h-6 sm:w-8 sm:h-8 animate-spin text-amber-400" />
                      </div>
                      <span className="text-base sm:text-lg text-stone-400">Loading balance...</span>
                    </div>
                  ) : balance !== '0' ? (
                    <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                      <span className="leading-none">{formatBalance(balance)}</span>
                      <span className="text-xl sm:text-2xl md:text-3xl text-amber-300 leading-none">AURA</span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center gap-3 sm:gap-4">
                      <span className="text-stone-400 leading-none">0 AURA</span>
                      <div className="text-xs sm:text-sm text-stone-400 font-normal bg-black/20 px-3 sm:px-4 py-2 rounded-full border border-stone-600/20 max-w-full tracking-wide">
                        Complete books to earn your first tokens!
                      </div>
                    </div>
                  )}
                </div>
              </div>
              
              {/* Balance decoration */}
              <div className="flex justify-center items-center gap-2 mt-4">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                <div className="text-xs text-stone-400 font-medium tracking-wide">Live Balance</div>
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
              </div>
            </div>

          {/* Enhanced Book Rewards Summary */}
          {user && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-semibold text-amber-400 flex items-center gap-3 font-pixel tracking-[0.12em] [text-shadow:0_1px_2px_rgba(0,0,0,0.8)]">
                  <BookOpen className="w-6 h-6 text-amber-400" />
                  Reading Rewards
                </h3>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowRewardsModal(true)}
                  className="bg-black/40 border-stone-600/20 text-stone-300 hover:bg-black/60 hover:border-amber-400/30 hover:text-amber-400 hover:scale-[1.001] transition-all duration-300 ease-out h-10 sm:h-11 px-3 sm:px-4 tracking-wide"
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
                <div className="p-4 sm:p-5 bg-black/20 border border-stone-600/15 rounded-xl hover:border-stone-500/25 transition-all duration-300 ease-out">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <span className="text-base font-semibold text-amber-400 tracking-wide">Pending Rewards</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-amber-400 tracking-wide">
                      {pendingRewards.length}
                    </div>
                    <div className="text-sm text-stone-400">
                      {totalPendingAmount} AURA waiting
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div 
                        className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((pendingRewards.length / 10) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
                
                {/* Earned Rewards Card */}
                <div className="p-4 sm:p-5 bg-black/20 border border-stone-600/15 rounded-xl hover:border-stone-500/25 transition-all duration-300 ease-out">
                  <div className="flex items-center gap-3 mb-3">
                    <Coins className="w-5 h-5 text-amber-400" />
                    <span className="text-base font-semibold text-amber-400 tracking-wide">Total Earned</span>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="text-2xl font-bold text-amber-400 tracking-wide">
                      {totalCompletedRewards}
                    </div>
                    <div className="text-sm text-stone-400">
                      AURA from reading
                    </div>
                    <div className="w-full bg-black/30 rounded-full h-2">
                      <div 
                        className="bg-amber-400 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((totalCompletedRewards / 100) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            
              {/* Empty State */}
              {pendingRewards.length === 0 && totalCompletedRewards === 0 && (
                <div className="p-6 bg-black/20 border border-stone-600/20 rounded-xl text-center">
                  <div className="w-16 h-16 mx-auto mb-4 bg-black/40 rounded-full flex items-center justify-center border border-stone-600/30">
                    <BookOpen className="w-8 h-8 text-amber-400" />
                  </div>
                  <h4 className="text-lg font-semibold text-stone-300 mb-2">Start Your Reading Journey</h4>
                  <p className="text-stone-400 text-sm mb-3">
                    Complete books to start earning AURA tokens!
                  </p>
                  <div className="inline-flex items-center gap-2 px-4 py-2 bg-black/20 border border-stone-600/30 rounded-full text-xs text-stone-300">
                    <Coins className="w-3 h-3" />
                    <span>1 AURA per page read</span>
                  </div>
                </div>
              )}

              {/* Pending Rewards Notice */}
              {pendingRewards.length > 0 && (
                <div className="p-5 bg-black/20 border border-stone-600/20 rounded-xl">
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className="w-5 h-5 text-amber-400" />
                    <h4 className="text-base font-semibold text-amber-300">Processing Rewards</h4>
                  </div>
                  
                  <p className="text-stone-300 text-sm mb-2">
                    You have <span className="font-bold text-amber-300">{pendingRewards.length}</span> pending reward{pendingRewards.length !== 1 ? 's' : ''} totaling <span className="font-bold text-amber-300">{totalPendingAmount} AURA</span>
                  </p>
                  <p className="text-stone-400 text-xs">
                    Rewards are processed by the admin and will be added to your balance soon
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Token Info */}
          {tokenInfo && (
            <div className="p-5 bg-black/20 border border-stone-600/15 rounded-xl">
              <h4 className="text-sm font-semibold text-amber-400 mb-4 flex items-center gap-2 tracking-wide">
                <div className="w-2 h-2 bg-amber-400 rounded-full" />
                Token Information
              </h4>
              
              <div className="space-y-3 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Token Name:</span>
                  <span className="text-amber-400 font-medium tracking-wide">{tokenInfo.name}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Symbol:</span>
                  <span className="text-amber-400 font-medium tracking-wide">{tokenInfo.symbol}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-stone-400">Total Supply:</span>
                  <span className="text-amber-400 font-medium font-mono tracking-wider">{formatBalance(tokenInfo.totalSupply)}</span>
                </div>
              </div>
            </div>
          )}

          {/* Contract Info */}
          <div className="p-4 bg-black/20 border border-stone-600/15 rounded-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-full bg-black/40 flex items-center justify-center border border-stone-600/20">
                  <ExternalLink className="w-4 h-4 text-stone-400" />
                </div>
                <div>
                  <div className="text-sm font-medium text-stone-300 tracking-wide">Smart Contract</div>
                  <div className="text-xs text-stone-500 font-mono tracking-wider">
                    {AURACOIN_CONFIG.CONTRACT_ID.slice(0, 12)}...{AURACOIN_CONFIG.CONTRACT_ID.slice(-8)}
                  </div>
                </div>
              </div>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(getContractExplorerUrl(), '_blank')}
                className="text-stone-400 hover:text-stone-300 hover:bg-black/20 hover:scale-[1.001] transition-all duration-300 ease-out h-9 px-3"
              >
                <ExternalLink className="w-4 h-4 mr-1.5" />
                <span className="text-xs font-medium tracking-wide">Explorer</span>
              </Button>
            </div>
          </div>

          {/* Refresh Button */}
          <Button
            onClick={() => {
              loadData();
              loadPendingRewards();
            }}
            disabled={loading}
            variant="outline"
            size="lg"
            className="w-full h-12 sm:h-14 bg-black/40 border-stone-600/20 text-stone-300 hover:bg-black/60 hover:border-amber-400/30 hover:text-amber-400 hover:scale-[1.001] transition-all duration-300 ease-out tracking-wide"
            aria-label="Refresh AuraCoin balance and pending rewards"
          >
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <RefreshCw className={`w-4 h-4 sm:w-5 sm:h-5 ${loading ? 'animate-spin' : ''} transition-transform duration-300`} />
              <span className="font-medium text-sm sm:text-base tracking-wide">
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
        
        {/* Rewards Details Modal */}
        <RewardsDetailsModal 
          isOpen={showRewardsModal} 
          onOpenChange={setShowRewardsModal} 
        />
      </div>
    </Card>
  );
};