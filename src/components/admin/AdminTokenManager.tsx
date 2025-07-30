import { useState, useEffect } from 'react';
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
  AURACOIN_CONFIG 
} from '@/utils/auraCoinUtils';
import { 
  Coins, 
  Send, 
  Plus, 
  Flame, 
  RefreshCw, 
  Loader2,
  AlertTriangle
} from 'lucide-react';

export const AdminTokenManager = () => {
  const { user } = useAuth();
  const { isWalletConnected, walletAddress, signTransactionWithWallet } = useFreighter();
  
  const [balance, setBalance] = useState<string>('0');
  const [tokenInfo, setTokenInfo] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [mintAmount, setMintAmount] = useState('100');
  const [transferAmount, setTransferAmount] = useState('10');
  const [transferTo, setTransferTo] = useState('');
  const [burnAmount, setBurnAmount] = useState('5');

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
      
      await loadData(); // Refresh balance
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

  // Load data when wallet connects
  useEffect(() => {
    if (isWalletConnected && walletAddress) {
      loadData();
    }
  }, [isWalletConnected, walletAddress]);

  return (
    <Card className="bg-black/60 backdrop-blur-md border-amber-500/30 text-stone-300 shadow-xl shadow-amber-500/10">
      <CardHeader>
        <CardTitle className="text-amber-200 font-pixel tracking-wider flex items-center gap-2">
          <Coins className="w-5 h-5" />
          Token Management
          <Badge variant="secondary" className="ml-auto bg-amber-500/20 text-amber-200">
            Admin Only
          </Badge>
        </CardTitle>
        <CardDescription className="text-amber-400/70">
          Mint, transfer, and burn AURA tokens
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Admin Balance Display */}
        <div className="text-center p-4 bg-amber-500/10 rounded-lg border border-amber-500/20">
          <div className="text-sm text-amber-400/70 mb-1">Admin Balance</div>
          <div className="text-2xl font-bold text-amber-300">
            {loading ? (
              <Loader2 className="w-6 h-6 animate-spin inline" />
            ) : (
              `${formatBalance(balance)} AURA`
            )}
          </div>
        </div>

        {/* Token Info */}
        {tokenInfo && (
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="text-stone-500">Total Supply:</span>
              <span className="ml-2 text-amber-300">{formatBalance(tokenInfo.totalSupply)}</span>
            </div>
            <div>
              <span className="text-stone-500">Decimals:</span>
              <span className="ml-2 text-amber-300">{tokenInfo.decimals}</span>
            </div>
          </div>
        )}

        {/* Warning Message */}
        <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
            <div className="text-sm">
              <div className="text-red-300 font-medium">Admin Operations Only</div>
              <div className="text-red-400/70 text-xs mt-1">
                These operations affect the token supply and should be used carefully.
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="space-y-4">
          {/* Mint Tokens */}
          <div className="space-y-2">
            <Label htmlFor="admin-mint-amount" className="text-amber-300">Mint Tokens</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="admin-mint-amount"
                type="number"
                value={mintAmount}
                onChange={(e) => setMintAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 h-10 bg-stone-800/50 border-stone-700"
              />
              <Button 
                onClick={handleMint} 
                disabled={loading}
                size="sm"
                className="bg-green-600 hover:bg-green-700 h-10 px-4 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Plus className="w-4 h-4 mr-2" />
                )}
                Mint
              </Button>
            </div>
          </div>

          {/* Transfer Tokens */}
          <div className="space-y-2">
            <Label htmlFor="admin-transfer-to" className="text-amber-300">Transfer Tokens</Label>
            <Input
              id="admin-transfer-to"
              value={transferTo}
              onChange={(e) => setTransferTo(e.target.value)}
              placeholder="Recipient Address (G...)"
              className="mb-2 h-10 bg-stone-800/50 border-stone-700"
            />
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                type="number"
                value={transferAmount}
                onChange={(e) => setTransferAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 h-10 bg-stone-800/50 border-stone-700"
              />
              <Button 
                onClick={handleTransfer} 
                disabled={loading}
                size="sm"
                className="bg-blue-600 hover:bg-blue-700 h-10 px-4 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                Send
              </Button>
            </div>
          </div>

          {/* Burn Tokens */}
          <div className="space-y-2">
            <Label htmlFor="admin-burn-amount" className="text-amber-300">Burn Tokens</Label>
            <div className="flex flex-col sm:flex-row gap-2">
              <Input
                id="admin-burn-amount"
                type="number"
                value={burnAmount}
                onChange={(e) => setBurnAmount(e.target.value)}
                placeholder="Amount"
                className="flex-1 h-10 bg-stone-800/50 border-stone-700"
              />
              <Button 
                onClick={handleBurn} 
                disabled={loading}
                size="sm"
                className="bg-red-600 hover:bg-red-700 h-10 px-4 disabled:opacity-50"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-2" />
                ) : (
                  <Flame className="w-4 h-4 mr-2" />
                )}
                Burn
              </Button>
            </div>
          </div>
        </div>

        {/* Refresh Button */}
        <Button
          onClick={loadData}
          disabled={loading}
          variant="outline"
          size="sm"
          className="w-full border-amber-500/30 text-amber-300 hover:bg-amber-500/10 h-10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Balance
        </Button>
      </CardContent>
    </Card>
  );
};