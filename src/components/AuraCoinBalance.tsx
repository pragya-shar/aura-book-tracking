import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useFreighter } from '@/contexts/FreighterContext';
import { toast } from '@/hooks/use-toast';
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
import { 
  Coins, 
  Send, 
  Plus, 
  Flame, 
  ExternalLink, 
  RefreshCw, 
  Loader2 
} from 'lucide-react';

export const AuraCoinBalance = () => {
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
      console.log('Starting mint operation...');
      console.log('Wallet address:', walletAddress);
      console.log('Amount to mint:', mintAmount);
      
      await mintTokens(
        walletAddress,
        parseInt(mintAmount),
        async (xdr) => {
          console.log('Signing transaction...');
          const signedXdr = await signTransactionWithWallet(xdr, 'testnet');
          console.log('Transaction signed successfully');
          return signedXdr;
        }
      );
      
      toast({
        title: "Tokens Minted!",
        description: `Successfully minted ${mintAmount} AURA tokens`,
      });
      
      await loadData(); // Refresh balance
    } catch (error) {
      console.error('Minting error details:', error);
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
    if (!isWalletConnected || !walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your wallet first",
        variant: "destructive",
      });
      return;
    }

    if (!transferTo.trim()) {
      toast({
        title: "Invalid Address",
        description: "Please enter a valid recipient address",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      await transferTokens(
        walletAddress,
        transferTo.trim(),
        parseInt(transferAmount),
        (xdr) => signTransactionWithWallet(xdr, 'testnet')
      );
      
      toast({
        title: "Transfer Successful!",
        description: `Sent ${transferAmount} AURA to ${transferTo.slice(0, 8)}...`,
      });
      
      await loadData(); // Refresh balance
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
      await burnTokens(
        walletAddress,
        parseInt(burnAmount),
        (xdr) => signTransactionWithWallet(xdr, 'testnet')
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
          onClick={loadData}
          disabled={loading}
          variant="outline"
          size="sm"
          className="w-full border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
        >
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh Balance
        </Button>
      </CardContent>
    </Card>
  );
}; 