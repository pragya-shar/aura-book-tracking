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
  Clock
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
      const { data, error } = await supabase
        .from('pending_rewards')
        .select('id, book_title, reward_amount, book_pages, completed_at, status')
        .eq('user_id', user.id)
        .eq('status', 'pending')
        .order('created_at', { ascending: false });

      if (error) throw error;
      
      // Cast status to the expected type since database returns string | null
      const typedRewards = data?.map(reward => ({
        ...reward,
        status: (reward.status || 'pending') as 'pending' | 'processing' | 'completed' | 'failed'
      })) || [];
      
      setPendingRewards(typedRewards);
    } catch (error) {
      console.error('Error loading pending rewards:', error);
      setPendingRewards([]);
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
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint tokens",
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

    return () => subscription.unsubscribe();
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
        <CardContent>
          <p className="text-stone-500 text-sm">Please connect your Freighter wallet to access AuraCoin features.</p>
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
              <Loader2 className="w-8 h-8 animate-spin mx-auto" />
            ) : (
              `${formatBalance(balance)} AURA`
            )}
          </div>
          <div className="text-sm text-stone-500 mt-1">
            Available Balance
          </div>
        </div>

        {/* Book Rewards Section */}
        {user && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-purple-200 flex items-center gap-2">
                <BookOpen className="w-5 h-5" />
                Book Rewards
              </h3>
              <Badge variant="outline" className="text-purple-400">
                {pendingRewards.length} pending
              </Badge>
            </div>
            
            {pendingRewards.length > 0 ? (
              <div className="space-y-3">
                <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <div className="text-amber-400 font-medium">
                        {pendingRewards.length} book{pendingRewards.length !== 1 ? 's' : ''} completed
                      </div>
                      <div className="text-sm text-stone-400">
                        {totalPendingAmount} AURA tokens pending
                      </div>
                    </div>
                    <div className="flex items-center gap-1 text-amber-400">
                      <Clock className="w-4 h-4" />
                      <span className="text-xs">Processing</span>
                    </div>
                  </div>
                </div>
                
                {/* List of pending rewards */}
                <div className="space-y-2">
                  {pendingRewards.slice(0, 3).map((reward) => (
                    <div key={reward.id} className="p-2 bg-stone-800/50 border border-stone-700 rounded text-xs">
                      <div className="flex justify-between items-center">
                        <div className="flex-1 min-w-0">
                          <div className="font-medium text-white truncate">{reward.book_title}</div>
                          <div className="text-stone-400">{reward.book_pages} pages • {new Date(reward.completed_at).toLocaleDateString()}</div>
                        </div>
                        <div className="text-amber-400 font-bold ml-2">
                          {reward.reward_amount} AURA
                        </div>
                      </div>
                    </div>
                  ))}
                  {pendingRewards.length > 3 && (
                    <div className="text-xs text-stone-500 text-center">
                      +{pendingRewards.length - 3} more pending rewards...
                    </div>
                  )}
                </div>
                
                <div className="text-xs text-stone-500">
                  Total earned: {totalCompletedRewards} AURA tokens
                </div>
              </div>
            ) : (
              <div className="p-3 bg-stone-800/50 border border-stone-700 rounded-lg">
                <div className="text-center text-stone-400 text-sm">
                  No pending rewards. Complete books to earn AURA tokens!
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
            <div className="flex gap-2">
              <Input
                id="mint-amount"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1"
              />
              <Button 
                onClick={handleMint} 
                disabled={loading}
                size="sm"
                className="bg-green-600 hover:bg-green-700"
              >
                <Plus className="w-4 h-4" />
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
              className="mb-2"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1"
              />
              <Button 
                onClick={handleTransfer} 
                disabled={loading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Send className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Burn Tokens */}
          <div className="space-y-2">
            <Label htmlFor="burn-amount" className="text-stone-300">Burn Tokens</Label>
            <div className="flex gap-2">
              <Input
                id="burn-amount"
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1"
              />
              <Button 
                onClick={handleBurn} 
                disabled={loading}
                size="sm"
                className="bg-red-600 hover:bg-red-700"
              >
                <Flame className="w-4 h-4" />
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
          className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Balance & Rewards
        </Button>
      </CardContent>
    </Card>
  );
}; 