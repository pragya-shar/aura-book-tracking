import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useFreighter } from '@/contexts/FreighterContext';
import { mintTokens, getTokenInfo, AURACOIN_CONFIG } from '@/utils/auraCoinUtils';
import { runConnectionTests } from '@/utils/testContractConnection';
import { toast } from '@/hooks/use-toast';
import { 
  Coins, 
  Loader2, 
  TestTube,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Wifi
} from 'lucide-react';

export const AuraCoinTest = () => {
  const { isWalletConnected, walletAddress, signTransactionWithWallet } = useFreighter();
  const [loading, setLoading] = useState(false);
  const [mintAmount, setMintAmount] = useState('100');
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  const handleTestConnection = async () => {
    setLoading(true);
    try {
      console.log('🧪 Testing contract connection...');
      const workingContract = await runConnectionTests();
      
      if (workingContract) {
        toast({
          title: "✅ Connection Test Successful",
          description: `Found working contract: ${workingContract}`,
        });
      } else {
        toast({
          title: "⚠️ Connection Test Failed",
          description: "No working contracts found. Check console for details.",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('❌ Connection test failed:', error);
      toast({
        title: "❌ Connection Test Failed",
        description: error instanceof Error ? error.message : "Failed to test connection",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleGetTokenInfo = async () => {
    try {
      setLoading(true);
      const info = await getTokenInfo();
      setTokenInfo(info);
      toast({
        title: "Token Info Retrieved",
        description: `Name: ${info.name}, Symbol: ${info.symbol}`,
      });
    } catch (error) {
      console.error('Error getting token info:', error);
      toast({
        title: "Error",
        description: "Failed to get token info",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleMintTokens = async () => {
    if (!isWalletConnected || !walletAddress) {
      toast({
        title: "Wallet Not Connected",
        description: "Please connect your Freighter wallet first",
        variant: "destructive",
      });
      return;
    }

    setLoading(true);
    try {
      console.log('🧪 Testing AuraCoin minting...');
      console.log(`📋 Contract ID: ${AURACOIN_CONFIG.CONTRACT_ID}`);
      console.log(`👤 Wallet Address: ${walletAddress}`);
      console.log(`💰 Amount to mint: ${mintAmount}`);
      
      await mintTokens(
        walletAddress, // recipient
        parseInt(mintAmount), // amount
        walletAddress, // owner address (user is the owner/minter)
        async (xdr) => signTransactionWithWallet(xdr, 'TESTNET') // sign function - uppercase!
      );
      
      toast({
        title: "🎉 Minting Successful!",
        description: `Successfully minted ${mintAmount} AURA tokens`,
      });
    } catch (error) {
      console.error('❌ Minting failed:', error);
      toast({
        title: "Minting Failed",
        description: error instanceof Error ? error.message : "Failed to mint tokens",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const openContractExplorer = () => {
    const explorerUrl = `https://stellar.expert/explorer/testnet/contract/${AURACOIN_CONFIG.CONTRACT_ID}`;
    window.open(explorerUrl, '_blank');
  };

  return (
    <Card className="bg-black/60 backdrop-blur-md border-purple-500/30 text-stone-300 shadow-xl shadow-purple-500/10">
      <CardHeader>
        <CardTitle className="text-purple-200 font-pixel tracking-wider flex items-center gap-2">
          <TestTube className="w-5 h-5" />
          AuraCoin Contract Test
        </CardTitle>
        <CardDescription className="text-stone-400">
          Test the AuraCoin smart contract integration with your Freighter wallet
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Contract Info */}
        <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-stone-500">Contract ID:</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={openContractExplorer}
              className="text-purple-400 hover:text-purple-300"
            >
              <ExternalLink className="w-3 h-3 mr-1" />
              Explorer
            </Button>
          </div>
          <div className="text-xs font-mono text-purple-300 break-all">
            {AURACOIN_CONFIG.CONTRACT_ID}
          </div>
        </div>

        {/* Wallet Status */}
        <div className="p-4 bg-stone-800/50 rounded-lg border border-stone-700">
          <div className="flex items-center gap-2 mb-2">
            {isWalletConnected ? (
              <CheckCircle className="w-4 h-4 text-green-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-yellow-400" />
            )}
            <span className="text-sm font-medium">
              {isWalletConnected ? 'Wallet Connected' : 'Wallet Not Connected'}
            </span>
          </div>
          {walletAddress && (
            <div className="text-xs text-stone-400 break-all">
              {walletAddress}
            </div>
          )}
        </div>

        {/* Token Info */}
        {tokenInfo && (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <div className="text-sm font-medium text-green-400 mb-2">Token Information</div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div>
                <span className="text-stone-500">Name:</span>
                <span className="ml-2 text-green-300">{tokenInfo.name}</span>
              </div>
              <div>
                <span className="text-stone-500">Symbol:</span>
                <span className="ml-2 text-green-300">{tokenInfo.symbol}</span>
              </div>
              <div>
                <span className="text-stone-500">Decimals:</span>
                <span className="ml-2 text-green-300">{tokenInfo.decimals}</span>
              </div>
              <div>
                <span className="text-stone-500">Total Supply:</span>
                <span className="ml-2 text-green-300">{tokenInfo.totalSupply}</span>
              </div>
            </div>
          </div>
        )}

        {/* Test Actions */}
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="mint-amount" className="text-stone-300">Mint Amount (AURA)</Label>
            <Input
              id="mint-amount"
              type="number"
              value={mintAmount}
              onChange={(e) => setMintAmount(e.target.value)}
              placeholder="100"
              className="bg-stone-800/50 border-stone-700"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              onClick={handleTestConnection}
              disabled={loading}
              variant="outline"
              className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Wifi className="w-4 h-4 mr-2" />
              )}
              Test Connection
            </Button>

            <Button
              onClick={handleGetTokenInfo}
              disabled={loading}
              variant="outline"
              className="border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Coins className="w-4 h-4 mr-2" />
              )}
              Get Token Info
            </Button>

            <Button
              onClick={handleMintTokens}
              disabled={loading || !isWalletConnected}
              className="bg-purple-600 hover:bg-purple-700 disabled:bg-stone-600"
            >
              {loading ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Coins className="w-4 h-4 mr-2" />
              )}
              Mint Tokens
            </Button>
          </div>
        </div>

        {/* Instructions */}
        <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
          <div className="text-sm font-medium text-blue-400 mb-2">Test Instructions</div>
          <div className="text-xs text-stone-400 space-y-1">
            <div>1. Make sure your Freighter wallet is connected to TESTNET</div>
            <div>2. Click "Test Connection" to verify network connectivity</div>
            <div>3. Click "Get Token Info" to verify contract connection</div>
            <div>4. Enter an amount and click "Mint Tokens" to test minting</div>
            <div>5. Check the console for detailed logs</div>
            <div>6. Verify the transaction on Stellar Explorer</div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}; 