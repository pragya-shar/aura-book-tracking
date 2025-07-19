import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useFreighter } from '@/contexts/FreighterContext';
import { useAuth } from '@/contexts/AuthContext';
import { Wallet, Loader2, CheckCircle, XCircle, Link, Unlink } from 'lucide-react';
import { toast } from '@/hooks/use-toast';

interface FreighterWalletButtonProps {
  onSuccess?: (address: string) => void;
  className?: string;
}

export const FreighterWalletButton = ({ onSuccess, className }: FreighterWalletButtonProps) => {
  const { user } = useAuth();
  const { 
    isWalletConnected, 
    walletAddress, 
    isWalletLinked,
    isWalletLoginInProgress,
    connectWallet, 
    disconnectWallet,
    linkWalletToAccount,
    unlinkWalletFromAccount,
    loading, 
    error 
  } = useFreighter();
  const [isConnecting, setIsConnecting] = useState(false);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectWallet();
      if (walletAddress) {
        toast({
          title: "Wallet Connected!",
          description: `Connected to address: ${walletAddress.slice(0, 8)}...${walletAddress.slice(-8)}`,
        });
        onSuccess?.(walletAddress);
      }
    } catch (err) {
      toast({
        title: "Connection Failed",
        description: err instanceof Error ? err.message : "Failed to connect wallet",
        variant: "destructive",
      });
    } finally {
      setIsConnecting(false);
    }
  };

  const handleDisconnect = () => {
    disconnectWallet();
    toast({
      title: "Wallet Disconnected",
      description: "Your wallet has been disconnected",
    });
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

  if (isWalletConnected && walletAddress) {
    return (
      <div className={`flex flex-col gap-2 ${className}`}>
        <Button
          onClick={handleDisconnect}
          variant="outline"
          className="bg-green-500/10 border-green-500/30 text-green-200 hover:bg-green-500/20 hover:border-green-500/50"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Connected: {walletAddress.slice(0, 8)}...{walletAddress.slice(-8)}
        </Button>
        
        {/* Show wallet login status */}
        {isWalletLoginInProgress && (
          <div className="text-center p-2 bg-blue-500/10 border border-blue-500/30 rounded-md">
            <p className="text-xs text-blue-200">Checking linked account...</p>
          </div>
        )}
        
        {/* Show error message if any */}
        {error && (
          <div className="text-center p-2 bg-red-500/10 border border-red-500/30 rounded-md">
            <p className="text-xs text-red-200">{error}</p>
          </div>
        )}
        
        {user && (
          <div className="flex flex-col gap-1">
            {isWalletLinked ? (
              <Button
                onClick={handleUnlinkWallet}
                variant="outline"
                size="sm"
                className="bg-red-500/10 border-red-500/30 text-red-200 hover:bg-red-500/20 hover:border-red-500/50"
                disabled={loading}
              >
                <Unlink className="w-3 h-3 mr-1" />
                Unlink from Account
              </Button>
            ) : (
              <Button
                onClick={handleLinkWallet}
                variant="outline"
                size="sm"
                className="bg-blue-500/10 border-blue-500/30 text-blue-200 hover:bg-blue-500/20 hover:border-blue-500/50"
                disabled={loading}
              >
                <Link className="w-3 h-3 mr-1" />
                Link to Account
              </Button>
            )}
            <p className="text-xs text-stone-400 text-center">
              {isWalletLinked ? 'Linked to your account' : 'Not linked to account'}
            </p>
          </div>
        )}
        
        <p className="text-xs text-green-300/70 text-center">
          Click to disconnect wallet
        </p>
      </div>
    );
  }

  return (
    <Button
      onClick={handleConnect}
      disabled={loading || isConnecting}
      className={`bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white border-0 ${className}`}
    >
      {loading || isConnecting ? (
        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
      ) : (
        <Wallet className="w-4 h-4 mr-2" />
      )}
      {loading || isConnecting ? 'Connecting...' : 'Connect Freighter Wallet'}
    </Button>
  );
}; 