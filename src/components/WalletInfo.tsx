import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useFreighter } from '@/contexts/FreighterContext';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Copy, ExternalLink, LogOut, RefreshCw, Link, Unlink, User } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

export const WalletInfo = () => {
  const { user } = useAuth();
  const { 
    isWalletConnected, 
    walletAddress, 
    network, 
    networkDetails, 
    isWalletLinked,
    isWalletLoginInProgress,
    error,
    disconnectWallet,
    connectWallet,
    linkWalletToAccount,
    unlinkWalletFromAccount,
    loading 
  } = useFreighter();

  const copyAddress = async () => {
    if (walletAddress) {
      try {
        await navigator.clipboard.writeText(walletAddress);
        toast({
          title: "Address Copied!",
          description: "Wallet address copied to clipboard",
        });
      } catch (err) {
        toast({
          title: "Copy Failed",
          description: "Failed to copy address to clipboard",
          variant: "destructive",
        });
      }
    }
  };

  const openStellarExplorer = () => {
    if (walletAddress) {
      const explorerUrl = network === 'TESTNET' 
        ? `https://stellar.expert/explorer/testnet/account/${walletAddress}`
        : `https://stellar.expert/explorer/public/account/${walletAddress}`;
      window.open(explorerUrl, '_blank');
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
  };

  const handleReconnect = async () => {
    try {
      await connectWallet();
      toast({
        title: "Wallet Reconnected",
        description: "Successfully reconnected to your wallet",
      });
    } catch (err) {
      toast({
        title: "Reconnection Failed",
        description: "Failed to reconnect to wallet",
        variant: "destructive",
      });
    }
  };

  const handleLinkWallet = async () => {
    try {
      await linkWalletToAccount();
      toast({
        title: "Wallet Linked!",
        description: "Your wallet is now linked to your account",
      });
    } catch (err) {
      toast({
        title: "Link Failed",
        description: err instanceof Error ? err.message : "Failed to link wallet",
        variant: "destructive",
      });
    }
  };

  const handleUnlinkWallet = async () => {
    try {
      await unlinkWalletFromAccount();
      toast({
        title: "Wallet Unlinked",
        description: "Your wallet has been unlinked from your account",
      });
    } catch (err) {
      toast({
        title: "Unlink Failed",
        description: err instanceof Error ? err.message : "Failed to unlink wallet",
        variant: "destructive",
      });
    }
  };

  if (!isWalletConnected || !walletAddress) {
    return (
      <Card className="bg-black/60 backdrop-blur-md border-amber-500/30">
        <CardHeader>
          <CardTitle className="text-amber-200 flex items-center gap-2">
            <Wallet className="w-5 h-5" />
            Wallet Not Connected
          </CardTitle>
          <CardDescription className="text-stone-300">
            Connect your Freighter wallet to access Stellar features
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            onClick={handleReconnect}
            disabled={loading}
            className="w-full bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {loading ? <RefreshCw className="w-4 h-4 mr-2 animate-spin" /> : <Wallet className="w-4 h-4 mr-2" />}
            Connect Wallet
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-black/60 backdrop-blur-md border-green-500/30">
      <CardHeader>
        <CardTitle className="text-green-200 flex items-center gap-2">
          <Wallet className="w-5 h-5" />
          Wallet Connected
        </CardTitle>
        <CardDescription className="text-stone-300">
          Your Freighter wallet is connected and ready
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Show wallet login status */}
        {isWalletLoginInProgress && (
          <div className="p-3 bg-blue-500/10 border border-blue-500/30 rounded-md">
            <p className="text-sm text-blue-200 text-center">Checking linked account...</p>
          </div>
        )}
        
        {/* Show error message if any */}
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-sm text-red-200 text-center">{error}</p>
          </div>
        )}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">Address:</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-mono text-green-200">
                {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={copyAddress}
                className="h-6 w-6 p-0 text-stone-400 hover:text-green-200"
              >
                <Copy className="w-3 h-3" />
              </Button>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm text-stone-400">Network:</span>
            <Badge 
              variant={network === 'TESTNET' ? 'secondary' : 'default'}
              className={network === 'TESTNET' ? 'bg-yellow-500/20 text-yellow-200 border-yellow-500/30' : 'bg-green-500/20 text-green-200 border-green-500/30'}
            >
              {network}
            </Badge>
          </div>

          {networkDetails && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-400">Network URL:</span>
              <span className="text-xs text-stone-300 font-mono">
                {networkDetails.networkUrl?.split('//')[1] || 'N/A'}
              </span>
            </div>
          )}

          {user && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-400">Account Status:</span>
              <div className="flex items-center gap-2">
                <Badge 
                  variant={isWalletLinked ? 'default' : 'secondary'}
                  className={isWalletLinked ? 'bg-green-500/20 text-green-200 border-green-500/30' : 'bg-stone-500/20 text-stone-300 border-stone-500/30'}
                >
                  <User className="w-3 h-3 mr-1" />
                  {isWalletLinked ? 'Linked' : 'Not Linked'}
                </Badge>
              </div>
            </div>
          )}

          {user && (
            <div className="flex items-center justify-between">
              <span className="text-sm text-stone-400">Email:</span>
              <span className="text-sm text-stone-300">
                {user.email}
              </span>
            </div>
          )}
        </div>

        <div className="flex gap-2 pt-2">
          <Button
            variant="outline"
            size="sm"
            onClick={openStellarExplorer}
            className="flex-1 bg-blue-500/10 border-blue-500/30 text-blue-200 hover:bg-blue-500/20 hover:border-blue-500/50"
          >
            <ExternalLink className="w-3 h-3 mr-1" />
            Explorer
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={handleDisconnect}
            className="flex-1 bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20 hover:border-red-500/50"
          >
            <LogOut className="w-3 h-3 mr-1" />
            Disconnect
          </Button>
        </div>

        {user && (
          <div className="flex gap-2 pt-2">
            {isWalletLinked ? (
              <Button
                variant="outline"
                size="sm"
                onClick={handleUnlinkWallet}
                className="flex-1 bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20 hover:border-red-500/50"
                disabled={loading}
              >
                <Unlink className="w-3 h-3 mr-1" />
                Unlink Account
              </Button>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleLinkWallet}
                className="flex-1 bg-green-500/10 border-green-500/30 text-green-200 hover:bg-green-500/20 hover:border-green-500/50"
                disabled={loading}
              >
                <Link className="w-3 h-3 mr-1" />
                Link Account
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}; 