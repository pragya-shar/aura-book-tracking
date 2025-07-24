import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFreighter } from '@/contexts/FreighterContext';
import { toast } from '@/hooks/use-toast';
import { 
  Wallet, 
  Copy, 
  ExternalLink, 
  RefreshCw, 
  AlertCircle,
  CheckCircle,
  XCircle
} from 'lucide-react';

export const WalletInfo = () => {
  const { 
    isWalletConnected, 
    isWalletAllowed, 
    walletAddress, 
    network, 
    networkDetails,
    isWalletLinked,
    connectWallet, 
    disconnectWallet,
    loading,
    error
  } = useFreighter();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Wallet address copied to clipboard",
    });
  };

  const openExplorer = () => {
    if (walletAddress) {
      const explorerUrl = network === 'TESTNET' 
        ? `https://stellar.expert/explorer/testnet/account/${walletAddress}`
        : `https://stellar.expert/explorer/public/account/${walletAddress}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const testConnection = async () => {
    try {
      console.log('Testing wallet connection...');
      console.log('Connected:', isWalletConnected);
      console.log('Allowed:', isWalletAllowed);
      console.log('Address:', walletAddress);
      console.log('Network:', network);
      console.log('Network Details:', networkDetails);
      
      toast({
        title: "Connection Test",
        description: "Check console for detailed connection information",
      });
    } catch (err) {
      console.error('Connection test error:', err);
      toast({
        title: "Test Failed",
        description: "Error testing connection",
        variant: "destructive",
      });
    }
  };

  if (!isWalletConnected) {
    return (
      <Card className="bg-black/60 backdrop-blur-md border-purple-500/30 text-stone-300 shadow-xl shadow-purple-500/10">
        <CardHeader>
          <CardTitle className="text-purple-200 font-pixel tracking-wider flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Connection
          </CardTitle>
          <CardDescription className="text-stone-400">
            Connect your Freighter wallet to get started
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button 
            onClick={connectWallet} 
            disabled={loading}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                Connecting...
              </>
            ) : (
              <>
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </>
            )}
          </Button>
          
          {error && (
            <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
              <div className="flex items-center gap-2 text-red-400">
                <AlertCircle className="w-4 h-4" />
                <span className="text-sm">{error}</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/60 backdrop-blur-md border-purple-500/30 text-stone-300 shadow-xl shadow-purple-500/10">
      <CardHeader>
        <CardTitle className="text-purple-200 font-pixel tracking-wider flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Info
          <Badge variant="secondary" className="ml-auto">
            {network}
          </Badge>
        </CardTitle>
        <CardDescription className="text-stone-400">
          Your connected wallet information
        </CardDescription>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {/* Connection Status */}
        <div className="flex items-center justify-between p-3 bg-green-500/10 border border-green-500/30 rounded-lg">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-green-400" />
            <span className="text-sm text-green-400">Connected</span>
          </div>
          <div className="flex items-center gap-2">
            {isWalletLinked ? (
              <Badge variant="outline" className="text-green-400 border-green-400">
                Linked
              </Badge>
            ) : (
              <Badge variant="outline" className="text-yellow-400 border-yellow-400">
                Not Linked
              </Badge>
            )}
          </div>
        </div>

        {/* Wallet Address */}
        <div className="space-y-2">
          <Label className="text-sm text-stone-400">Wallet Address</Label>
          <div className="flex items-center gap-2 p-2 bg-stone-800/50 rounded border border-stone-700">
            <code className="text-xs text-purple-300 flex-1">
              {walletAddress?.slice(0, 12)}...{walletAddress?.slice(-8)}
            </code>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => copyToClipboard(walletAddress || '')}
              className="text-stone-400 hover:text-stone-300"
            >
              <Copy className="w-3 h-3" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={openExplorer}
              className="text-stone-400 hover:text-stone-300"
            >
              <ExternalLink className="w-3 h-3" />
            </Button>
          </div>
        </div>

        {/* Network Details */}
        {networkDetails && (
          <div className="space-y-2">
            <Label className="text-sm text-stone-400">Network Details</Label>
            <div className="p-2 bg-stone-800/50 rounded border border-stone-700">
              <div className="text-xs text-stone-400">
                <div>Network: {networkDetails.network}</div>
                <div>Passphrase: {networkDetails.networkPassphrase?.slice(0, 20)}...</div>
              </div>
            </div>
          </div>
        )}

        {/* Error Display */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-red-400">
              <XCircle className="w-4 h-4" />
              <span className="text-sm">{error}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-2">
          <Button
            onClick={testConnection}
            variant="outline"
            size="sm"
            className="flex-1 border-purple-500/30 text-purple-300 hover:bg-purple-500/10"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Test Connection
          </Button>
          <Button
            onClick={disconnectWallet}
            variant="outline"
            size="sm"
            className="border-red-500/30 text-red-300 hover:bg-red-500/10"
          >
            Disconnect
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

// Helper component for labels
const Label = ({ children, className = "" }: { children: React.ReactNode; className?: string }) => (
  <label className={`text-sm font-medium ${className}`}>{children}</label>
); 