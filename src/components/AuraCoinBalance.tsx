import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFreighter } from '@/contexts/FreighterContext';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  getBalance, 
  getTokenInfo, 
  mintTokens, 
  transferTokens, 
  burnTokens, 
  formatBalance,
  getContractExplorerUrl,
  AURACOIN_CONFIG 
} from '@/utils/auraCoinUtils';
import { AuraCoinRewardService } from '@/services/auraCoinRewardService';
import { RewardsDetailsModal } from '@/components/RewardsDetailsModal';
import { 
  Coins, 
  Send, 
  Plus, 
  Flame, 
  ExternalLink, 
  RefreshCw, 
  Loader2,
  Gift,
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

export const AuraCoinBalance = () => {
  const { user } = useAuth();
  const { isWalletConnected, walletAddress, signTransactionWithWallet, connectWallet } = useFreighter();
  
  const [balance, setBalance] = useState<string>('0');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mintAmount, setMintAmount] = useState('100');
  const [transferAmount, setTransferAmount] = useState('10');
  const [transferTo, setTransferTo] = useState('');
  const [burnAmount, setBurnAmount] = useState('5');
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

  // Mint tokens
  const handleMint = async () => {
    if (!isWalletConnected || !walletAddress || !user) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('Starting mint operation...');
      const result = await mintTokens(
        walletAddress, // to address (owner mints to themselves)
        parseInt(mintAmount, 10),
        walletAddress, // from address (owner's address)
        signTransactionWithWallet
      );

      // Update pending rewards status to 'completed' after successful mint
      if (result && result.hash) {
        const mintedAmount = parseInt(mintAmount, 10);
        
        // Update pending rewards that match the minted amount
        const { error: updateError } = await supabase
          .from('pending_rewards')
          .update({ 
            status: 'completed', 
            processed_at: new Date().toISOString(),
            transaction_hash: result.hash 
          })
          .eq('user_id', user.id)
          .eq('status', 'pending')
          .lte('reward_amount', mintedAmount); // Update rewards up to the minted amount
          
        if (updateError) {
          console.warn('Failed to update pending rewards status:', updateError);
          toast({
            title: "Partial Success", 
            description: `Tokens minted successfully, but failed to update reward status: ${updateError.message}`,
            variant: "destructive",
          });
        } else {
          toast({
            title: "Tokens Minted & Rewards Processed!",
            description: `Successfully minted ${mintAmount} AURA tokens and updated pending rewards`,
          });
        }
      } else {
        toast({
          title: "Tokens Minted!",
          description: `Successfully minted ${mintAmount} AURA tokens`,
        });
      }
      
      await loadData(); // Refresh balance and pending rewards
    } catch (error) {
      console.error('Minting error:', error);
      
      // Provide more specific error guidance
      let errorMessage = "Failed to mint tokens";
      let actionGuidance = "Please try again";
      
      if (error instanceof Error) {
        const errorMsg = error.message.toLowerCase();
        if (errorMsg.includes('network')) {
          errorMessage = "Network connection issue";
          actionGuidance = "Check your internet connection and try again";
        } else if (errorMsg.includes('insufficient')) {
          errorMessage = "Insufficient funds for transaction";
          actionGuidance = "Ensure you have enough XLM for transaction fees";
        } else if (errorMsg.includes('rejected') || errorMsg.includes('declined')) {
          errorMessage = "Transaction was rejected";
          actionGuidance = "Transaction was declined in wallet";
        } else if (errorMsg.includes('timeout')) {
          errorMessage = "Transaction timed out";
          actionGuidance = "Network is slow, please try again";
        } else {
          errorMessage = error.message;
        }
      }
      
      toast({
        title: "Minting Failed",
        description: `${errorMessage}. ${actionGuidance}`,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Transfer tokens
  const handleTransfer = async () => {
    if (!isWalletConnected || !walletAddress || !transferTo) {
      toast({
        title: "Invalid Input",
        description: "Please ensure wallet is connected and recipient address is provided",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await transferTokens(
        walletAddress, // from address
        transferTo, // to address
        parseInt(transferAmount, 10),
        signTransactionWithWallet
      );

      toast({
        title: "Transfer Successful!",
        description: `Successfully transferred ${transferAmount} AURA tokens`,
      });
      
      await loadData(); // Refresh balance
      setTransferTo(''); // Clear form
    } catch (error) {
      toast({
        title: "Transfer Failed",
        description: error instanceof Error ? error.message : "Failed to transfer tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Burn tokens
  const handleBurn = async () => {
    if (!isWalletConnected || !walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      const result = await burnTokens(
        walletAddress, // from address (owner burns their own tokens)
        parseInt(burnAmount, 10),
        signTransactionWithWallet
      );

      toast({
        title: "Tokens Burned!",
        description: `Successfully burned ${burnAmount} AURA tokens`,
      });
      
      await loadData(); // Refresh balance
    } catch (error) {
      toast({
        title: "Burning Failed",
        description: error instanceof Error ? error.message : "Failed to burn tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Claim all pending rewards (Note: This is for user display, actual processing is admin-only)
  const handleClaimAllRewards = async () => {
    toast({
      title: "Rewards Pending Processing",
      description: "Your rewards are pending and will be processed by the admin soon!",
      variant: "default",
    });
  };

  // Set up real-time subscription for pending rewards
  useEffect(() => {
    if (!user) return;

    const subscription = supabase
      .channel('pending_rewards_changes')
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
      <Card className="bg-black/60 backdrop-blur-md border-purple-500/30 text-stone-300 shadow-xl shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-purple-200 font-pixel tracking-wider flex items-center gap-2">
            <Coins className="w-5 h-5" />
            AuraCoin Balance
          </CardTitle>
          <CardDescription className="text-stone-400">
            Connect your wallet to view and manage AuraCoin tokens
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center">
              <Coins className="w-4 h-4 text-blue-400" />
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium text-blue-200">Wallet Required</div>
              <div className="text-xs text-blue-300/70">Connect your Freighter wallet to access AuraCoin features</div>
            </div>
          </div>
          
          <div className="text-xs text-stone-500 space-y-1">
            <div>• View your AURA token balance</div>
            <div>• See pending book rewards</div>
            <div>• Manage token transactions</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/60 backdrop-blur-md border-purple-500/30 text-stone-300 shadow-xl shadow-purple-500/10">
      <CardHeader>
        <CardTitle className="text-purple-200 font-pixel tracking-wider flex items-center gap-2">
          <Coins className="w-5 h-5" />
          AuraCoin Balance
          <Badge variant="secondary" className="ml-auto">
            {AURACOIN_CONFIG.NETWORK}
          </Badge>
        </CardTitle>
        <CardDescription className="text-stone-400">
          Manage your AURA tokens on Stellar testnet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Token Info */}
        {tokenInfo && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-stone-500">Name:</span>
              <span className="ml-2 text-purple-300">{tokenInfo.name}</span>
            </div>
            <div>
              <span className="text-stone-500">Symbol:</span>
              <span className="ml-2 text-purple-300">{tokenInfo.symbol}</span>
            </div>
            <div>
              <span className="text-stone-500">Decimals:</span>
              <span className="ml-2 text-purple-300">{tokenInfo.decimals}</span>
            </div>
            <div>
              <span className="text-stone-500">Total Supply:</span>
              <span className="ml-2 text-purple-300">{formatBalance(tokenInfo.totalSupply)}</span>
            </div>
          </div>
        )}

        {/* Balance Display */}
        <div className="text-center p-4 bg-purple-500/10 rounded-lg border border-purple-500/20">
          <div className="text-2xl font-bold text-purple-300">
            {loading ? (
              <div className="flex flex-col items-center gap-2">
                <Loader2 className="w-8 h-8 animate-spin" />
                <span className="text-sm text-purple-400">Loading balance...</span>
              </div>
            ) : balance !== '0' ? (
              `${formatBalance(balance)} AURA`
            ) : (
              <div className="flex flex-col items-center gap-1">
                <span>0 AURA</span>
                <span className="text-xs text-stone-500">No tokens yet</span>
              </div>
            )}
          </div>
          <div className="text-sm text-stone-500 mt-1">
            {loading ? "Checking wallet..." : "Available Balance"}
          </div>
        </div>

        {/* Book Rewards Summary */}
        {user && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Book Rewards
              </h3>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowRewardsModal(true)}
                className="text-purple-400 border-purple-500/30 hover:bg-purple-500/10 h-9 px-3"
              >
                <Eye className="w-4 h-4 mr-1 sm:mr-2" />
                <span className="text-xs sm:text-sm">Show Details</span>
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-3">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Clock className="w-4 h-4 text-amber-400" />
                  <span className="text-sm font-medium text-amber-400">Pending</span>
                </div>
                <div className="text-lg font-bold text-amber-300">
                  {pendingRewards.length}
                </div>
                <div className="text-xs text-amber-400/70">
                  {totalPendingAmount} AURA
                </div>
              </div>
              
              <div className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
                <div className="flex items-center gap-2 mb-1">
                  <Coins className="w-4 h-4 text-green-400" />
                  <span className="text-sm font-medium text-green-400">Earned</span>
                </div>
                <div className="text-lg font-bold text-green-300">
                  {totalCompletedRewards}
                </div>
                <div className="text-xs text-green-400/70">
                  AURA total
                </div>
              </div>
            </div>
            
            {pendingRewards.length === 0 && totalCompletedRewards === 0 && (
              <div className="p-3 bg-stone-800/50 border border-stone-700 rounded-lg text-center">
                <div className="text-stone-400 text-sm">
                  Complete books to start earning AURA tokens!
                </div>
              </div>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-4">
          {/* Mint Tokens */}
          <div className="space-y-2">
            <Label htmlFor="mint-amount" className="text-stone-300">Mint Tokens</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="mint-amount"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 h-10"
              />
              <Button 
                onClick={handleMint} 
                disabled={loading}
                size="sm"
                className="bg-green-600 hover:bg-green-700 h-10 px-4 sm:px-3 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin sm:mr-0 mr-1" />
                ) : (
                  <Plus className="w-4 h-4 sm:mr-0 mr-1" />
                )}
                <span className="sm:hidden">{loading ? "Minting..." : "Mint"}</span>
              </Button>
            </div>
          </div>

          {/* Transfer Tokens */}
          <div className="space-y-2">
            <Label htmlFor="transfer-to" className="text-stone-300">Transfer Tokens</Label>
            <Input
              id="transfer-to"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="Recipient Address (G...)"
              className="mb-2 h-10"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 h-10"
              />
              <Button 
                onClick={handleTransfer} 
                disabled={loading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 h-10 px-4 sm:px-3 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin sm:mr-0 mr-1" />
                ) : (
                  <Send className="w-4 h-4 sm:mr-0 mr-1" />
                )}
                <span className="sm:hidden">{loading ? "Sending..." : "Send"}</span>
              </Button>
            </div>
          </div>

          {/* Burn Tokens */}
          <div className="space-y-2">
            <Label htmlFor="burn-amount" className="text-stone-300">Burn Tokens</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="burn-amount"
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 h-10"
              />
              <Button 
                onClick={handleBurn} 
                disabled={loading}
                size="sm"
                className="bg-red-600 hover:bg-red-700 h-10 px-4 sm:px-3 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin sm:mr-0 mr-1" />
                ) : (
                  <Flame className="w-4 h-4 sm:mr-0 mr-1" />
                )}
                <span className="sm:hidden">{loading ? "Burning..." : "Burn"}</span>
              </Button>
            </div>
          </div>
        </div>

        {/* Contract Info */}
        <div className="pt-4 border-t border-purple-500/20">
          <div className="flex items-center justify-between text-xs text-stone-500">
            <span>Contract: {AURACOIN_CONFIG.CONTRACT_ID.slice(0, 8)}...</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => window.open(getContractExplorerUrl(), '_blank')}
              className="text-purple-400 hover:text-purple-300"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Explorer
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
          size="sm"
          className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10 h-10"
        >
          <RefreshCw className={`w-4 h-4 mr-1 sm:mr-2 ${loading ? 'animate-spin' : ''}`} />
          <span className="text-xs sm:text-sm">Refresh Balance & Rewards</span>
        </Button>
      </CardContent>
      
      {/* Rewards Details Modal */}
      <RewardsDetailsModal 
        isOpen={showRewardsModal} 
        onOpenChange={setShowRewardsModal} 
      />
    </Card>
  );
}; 